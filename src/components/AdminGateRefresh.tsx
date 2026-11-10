"use client";

import { useEffect } from "react";

export function AdminGateRefresh() {
  useEffect(() => {
    void fetch("/admin/gate", { method: "POST" });
  }, []);
  return null;
}
