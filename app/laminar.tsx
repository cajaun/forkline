import React from "react";
import { ShowcaseRoute } from "@/components-showcase/showcase-route";
import { LaminarShowcase } from "@/components-showcase/home/laminar-showcase";

export default function LaminarRoute() {
  return (
    <ShowcaseRoute title="Laminar">
      <LaminarShowcase />
    </ShowcaseRoute>
  );
}
