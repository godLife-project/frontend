// src/components/routine/RoutineForm/dialogs/CreateRoutineDialog.js
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CreateRoutineDialog({ open, onOpenChange, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>루틴 생성</DialogTitle>
          <DialogDescription>
            루틴을 생성하고 바로 시작하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex items-center justify-end space-x-2">
          <Button variant="outline" onClick={() => onConfirm(false)}>
            아니오, 나중에 시작할게요
          </Button>
          <Button onClick={() => onConfirm(true)}>예, 지금 시작합니다</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
