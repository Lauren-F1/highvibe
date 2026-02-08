'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Triangle } from "lucide-react";

export function BuilderModeBanner() {
  return (
    <Alert className="m-4 border-yellow-500 text-yellow-700 rounded-lg">
      <Triangle className="h-4 w-4 !text-yellow-500" />
      <AlertTitle className="font-bold">Preview Mode</AlertTitle>
      <AlertDescription>
        Sample data enabled.
      </AlertDescription>
    </Alert>
  );
}
