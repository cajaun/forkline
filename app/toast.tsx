import React from "react";
import { ShowcaseRoute } from "@/components-showcase/showcase-route";
import { ToastShowcase } from "@/components-showcase/home/toast-showcase";

export default function ToastRoute() {
  return (
    <ShowcaseRoute title="Toast">
      <ToastShowcase />
    </ShowcaseRoute>
  );
}
