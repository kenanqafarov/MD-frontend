import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import usePermissionStore from "../../../stores/permissionStore";
import "../../assets/style/PermissionPage/editpermission.css";

const permissionsList = [
  {
    group: null,
    items: [
      "Ümumi təqvim",
      "Pasientlər",
      "Müayinələri",
      "Planları",
      "Müalicələr",
      "Anamnez",
      "Sığortaları",
      "Reseptləri",
      "Rentgen",
      "Fotolar",
      "Videolar",
      "Hesabat",
    ],
  },
  {
    group: "QRAFİKLƏR",
    items: [
      "Mənim təqvimim",
      "Növbə gözləyənlər",
      "Həkimlər",
      "Həkimlərin iş qrafiki",
      "Görülmüş işlər",
    ],
  },
  {
    group: "LABORATORİYA",
    items: [
      "Göndərilən sifarişlər",
      "Gələn sifarişlər",
      "Texniklər üzrə hesabat",
    ],
  },
  {
    group: "ANBAR ƏMƏLİYYATLARI",
    items: [
      "Klinikanın stoku",
      "Kabinet/Obyekt stoku",
      "Anbara maddəxil",
      "Anbara sifariş",
      "Anbardan maxaric",
      "Anbardan daxilolmalar",
      "Anbardan silinmə",
      "Məhsul istifadəsi",
    ],
  },
  {
    group: "TƏNZİMLƏMƏLƏR",
    items: [
      "İcazələr",
      "Admin istifadəçiləri",
      "Texniklər",
      "Randevu tipləri",
      "Müayinə siyahısı",
      "Əməliyyat növləri",
      "Digər",
      "Rənglər",
      "İmplantlar",
      "Qarnirlar",
      "Sığorta şirkətləri",
      "Qiymət kateqoriyaları",
      "Kabinetlər",
      "Digər obyektlər",
      "Reseptlər",
      "Tövsiyə edənlər",
      "Anamnez siyahısı",
      "Elmi dərəcələr",
      "İxtisaslar",
      "Məhsul kateqoriyaları",
      "Qara siyahı səbəbləri",
      "Ümumi tənzimləmələr",
    ],
  },
];

const actions = ["Oxuma", "Yaratma", "Redaktə", "Silmə", "Status", "Sıralama"];

const capitalizeWords = (str) => {
  return str.split(' ').map(word => {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
};

function EditPermission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedPermission, fetchPermissionById, updatePermission } =
    usePermissionStore();

  const [name, setName] = useState("");
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const initial = {};
    permissionsList.forEach((group) => {
      group.items.forEach((item) => {
        initial[item] = {};
        actions.forEach((action) => {
          initial[item][action] = false;
        });
      });
    });
    setChecked(initial);
  }, []);

  useEffect(() => {
    if (id) {
      fetchPermissionById(Number(id));
    }
  }, [id]);

  useEffect(() => {
    if (selectedPermission) {
      setName(selectedPermission.permissionName || "");

      const updatedChecked = {};
      permissionsList.forEach((group) => {
        group.items.forEach((item) => {
          updatedChecked[item] = {};
          actions.forEach((action) => {
            updatedChecked[item][action] = false;
          });
        });
      });

      selectedPermission.modulePermissions?.forEach((p) => {
        const { moduleUrl, actions: backendActions } = p;
        backendActions.forEach((action) => {
          const frontendAction = convertBackendAction(action);
          if (updatedChecked[moduleUrl]) {
            updatedChecked[moduleUrl][frontendAction] = true;
          }
        });
      });

      setChecked(updatedChecked);
    }
  }, [selectedPermission]);

  const convertBackendAction = (action) => {
    switch (action) {
      case "READ":
        return "Oxuma";
      case "CREATE":
        return "Yaratma";
      case "UPDATE":
        return "Redaktə";
      case "DELETE":
        return "Silmə";
      case "STATUS":
        return "Status";
      case "SORT":
        return "Sıralama";
      default:
        return action;
    }
  };

  const convertFrontendAction = (action) => {
    switch (action) {
      case "Oxuma":
        return "READ";
      case "Yaratma":
        return "CREATE";
      case "Redaktə":
        return "UPDATE";
      case "Silmə":
        return "DELETE";
      case "Status":
        return "STATUS";
      case "Sıralama":
        return "SORT";
      default:
        return action;
    }
  };

  const isActionAllChecked = (action) =>
    Object.keys(checked).every((item) => checked[item]?.[action]);

  const isRowAllChecked = (item) =>
    checked[item] ? actions.every((action) => checked[item][action]) : false;

  const handleCheckAll = (action) => {
    const allChecked = isActionAllChecked(action);
    setChecked((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((item) => {
        updated[item][action] = !allChecked;
      });
      return updated;
    });
  };

  const handleCheckRow = (item) => {
    const allChecked = isRowAllChecked(item);
    setChecked((prev) => ({
      ...prev,
      [item]: actions.reduce((acc, action) => {
        acc[action] = !allChecked;
        return acc;
      }, {}),
    }));
  };

  const handleCheck = (item, action) => {
    setChecked((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        [action]: !prev[item][action],
      },
    }));
  };

  const handleNameChange = (e) => {
    setName(capitalizeWords(e.target.value));
  };

  const handleSave = async () => {
    const permissions = [];

    Object.entries(checked).forEach(([moduleUrl, actionMap]) => {
      const selectedActions = Object.entries(actionMap)
        .filter(([_, isChecked]) => isChecked)
        .map(([action]) => convertFrontendAction(action));

      const matchedModule = selectedPermission?.modulePermissions?.find(
        (m) => m.moduleUrl === moduleUrl
      );

      // Hər halda modulun aksiyaları göndər - backend boş aksiyaları (delete) kimi işlə
      permissions.push({
        modulePermissionId: matchedModule?.modulePermissionId || 0,
        moduleUrl,
        actions: selectedActions,
      });
    });

    const payload = {
      id: Number(id),
      permissionName: name,
      permissions,
    };

    console.log("Göndərilən payload:", payload);

    try {
      await updatePermission(payload);
      navigate("/permissions");
    } catch (error) {
      console.error("Xəta baş verdi:", error);
    }
  };

  return (
    <div className="addPermissionContainer">
      <div className="addPermissionWrapper">
        <form
          className="addPermissionForm"
          onSubmit={(e) => e.preventDefault()}>
          <div className="topPartForm">
            <label htmlFor="name">
              İcazənin adı <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="İcazənin adı"
              onChange={handleNameChange}
              required
            />
          </div>

          <label style={{ marginTop: 20, fontWeight: "bold" }}>
            İcazələr (redaktə)
          </label>
          <div className="permissionTableWrapper">
            <table
              className="permissionTable"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#f8f9fa",
              }}>
              <thead>
                <tr>
                  <th>İcazələr</th>
                  {actions.map((action) => (
                    <th key={action}>
                      <input
                        type="checkbox"
                        checked={isActionAllChecked(action)}
                        onChange={() => handleCheckAll(action)}
                      />
                      <div>{action}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionsList.map((group, idx) => (
                  <React.Fragment key={group.group || "main-" + idx}>
                    {group.group && (
                      <tr>
                        <td
                          colSpan={actions.length + 1}
                          style={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            color: "#155EEF",
                          }}>
                          {group.group}
                        </td>
                      </tr>
                    )}
                    {group.items.map((item) => (
                      <tr key={item}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isRowAllChecked(item)}
                            onChange={() => handleCheckRow(item)}
                            style={{ marginRight: 8 }}
                          />
                          {item}
                        </td>
                        {actions.map((action) => (
                          <td key={action} style={{ textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={checked[item]?.[action] || false}
                              onChange={() => handleCheck(item, action)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="addPermissionActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={() => navigate("/permissions")}>
              <RxCross2 /> İmtina et
            </button>
            <button type="submit" className="saveBtn" onClick={handleSave}>
              <FiCheck /> Yadda saxla (redaktə)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPermission;