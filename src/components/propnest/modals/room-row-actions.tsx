import { useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MoreVerticalIcon, PencilIcon, Trash2Icon, Loader2Icon } from "lucide-react";
import { useLabels } from "@/lib/vertical-labels";
// Engine modules (brief §3) — consumed without modification.
import { useData, useAuth } from "@/parts/p1_imports_context.jsx";
import { usePortfolioCoverage } from "../coverage-context";
import { updateRoom, removeRoom } from "@/services/propertyService.js";

type RoomLite = { id: string; no: string; activeCount: number };

export type RoomRowActionsProps = { room: RoomLite };

/**
 * Admin-only room menu on a RoomRow header (brief §15 #3).
 * Rename → propertyService.updateRoom({ room_number }) (no rent change, no
 * coverage rebuild). Remove → propertyService.removeRoom, which refuses while
 * the room still has active tenants and returns that as an error we surface.
 */
export function RoomRowActions({ room }: RoomRowActionsProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="size-7 shrink-0"
            aria-label={`Actions for ${room.no}`}
            // Stop the row's expand/collapse toggle from firing.
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <PencilIcon /> Rename room
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setRemoveOpen(true)}>
            <Trash2Icon /> Remove room
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoomRenameSheet open={renameOpen} onOpenChange={setRenameOpen} room={room} />
      <RoomRemoveDialog open={removeOpen} onOpenChange={setRemoveOpen} room={room} />
    </>
  );
}

function useRefreshAll() {
  const { refresh: refreshData } = useData() as unknown as { refresh: () => void };
  const { refresh: refreshCoverage } = usePortfolioCoverage() as unknown as { refresh: () => void };
  return () => { refreshData(); refreshCoverage(); };
}

function RoomRenameSheet({
  open, onOpenChange, room,
}: { open: boolean; onOpenChange: (o: boolean) => void; room: RoomLite }) {
  const labels = useLabels();
  const refreshAll = useRefreshAll();
  const [name, setName] = useState(room.no);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setName(room.no); setSaving(false); } }, [open, room.no]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && trimmed !== room.no && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const { error } = (await updateRoom(room.id, { room_number: trimmed })) as {
        error: { message: string } | null;
      };
      if (error) throw new Error(error.message);
      refreshAll();
      toast.success(`${labels.unit} renamed`, { description: `${room.no} → ${trimmed}` });
      onOpenChange(false);
    } catch (err) {
      toast.error(`Couldn't rename ${labels.unit.toLowerCase()}`, {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm flex flex-col gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle><span className="text-brand-gradient">Rename {labels.unit.toLowerCase()}</span></SheetTitle>
          <SheetDescription>Changes the label only — tenants and payments are unaffected.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 p-5">
          <div className="space-y-2">
            <Label htmlFor="rr-name">{labels.unit} name</Label>
            <Input
              id="rr-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              placeholder="e.g. Room 12"
            />
          </div>
        </div>
        <SheetFooter className="flex-row gap-2 border-t bg-card p-4 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button variant="gradient" onClick={handleSave} disabled={!canSave}>
            {saving && <Loader2Icon className="animate-spin" />} Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function RoomRemoveDialog({
  open, onOpenChange, room,
}: { open: boolean; onOpenChange: (o: boolean) => void; room: RoomLite }) {
  const labels = useLabels();
  const refreshAll = useRefreshAll();
  const { user } = useAuth() as unknown as { user?: { id?: string } | null };
  const [removing, setRemoving] = useState(false);

  const blocked = room.activeCount > 0;

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const { error } = (await removeRoom(room.id, user?.id ?? null)) as {
        error: { message: string } | null;
      };
      if (error) throw new Error(error.message);
      refreshAll();
      toast.success(`${labels.unit} removed`, { description: `${room.no} was deleted.` });
      onOpenChange(false);
    } catch (err) {
      toast.error(`Couldn't remove ${labels.unit.toLowerCase()}`, {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {room.no}?</AlertDialogTitle>
          <AlertDialogDescription>
            {blocked ? (
              <>
                This {labels.unit.toLowerCase()} still has {room.activeCount} active
                {" "}{room.activeCount === 1 ? labels.occupant.toLowerCase() : labels.occupantPlural.toLowerCase()}.
                Move or vacate them first — the {labels.unit.toLowerCase()} can't be removed while occupied.
              </>
            ) : (
              <>This permanently deletes the {labels.unit.toLowerCase()}. This can't be undone.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); handleRemove(); }}
            disabled={removing || blocked}
            className="bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600"
          >
            {removing && <Loader2Icon className="animate-spin" />} Remove {labels.unit.toLowerCase()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
