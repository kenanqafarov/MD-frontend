import React from "react";
import { usePermission } from "../hooks/usePermission";

export const CanAccess = ({ module, action, fallback = null, children }) => {
  const { hasPermission } = usePermission();
  return hasPermission(module, action) ? children : fallback;
};

export default CanAccess;
