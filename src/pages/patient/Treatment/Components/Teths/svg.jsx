import InteractiveSVG from "./interactivesvg";
import data from "../../../Disler/data.json";

const Svg = ({ categoryCode = null, onToothSelect, resetSelection = false, patientPlansData = [], planKey = null, externalSelection = null }) => {
  return (
    <InteractiveSVG
      data={data}
      width={47}
      categoryCode={categoryCode}
      height={148}
      viewBox="0 0 57 148"
      defaultColor="#D1D5DB"
      hoverColor="#0040C1"
      activeColor="#FD4A3D"
      onToothSelect={onToothSelect}
      resetSelection={resetSelection}
      patientPlansData={patientPlansData}
      planKey={planKey}
      externalSelection={externalSelection}
    />
  );
};

export default Svg;
