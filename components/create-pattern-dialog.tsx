"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { CustomPattern } from "@/lib/types/api";

interface CreatePatternDialogProps {
  canonicalPatternId: string;
  canonicalPatternName: string;
  onCreated: (pattern: CustomPattern) => void;
  trigger?: React.ReactNode;
}

/**
 * Dialog for creating a new custom pattern
 */
export function CreatePatternDialog({
  canonicalPatternId,
  canonicalPatternName,
  onCreated,
  trigger,
}: CreatePatternDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a pattern name");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/patterns/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          canonicalPatternId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create pattern");
      }

      const newPattern: CustomPattern = await response.json();
      onCreated(newPattern);
      setName("");
      setOpen(false);
      toast.success("Custom pattern created!");
    } catch (error: any) {
      console.error("Error creating custom pattern:", error);
      toast.error(error.message || "Failed to create pattern");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="icon">
            <Plus className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Custom Pattern</DialogTitle>
          <DialogDescription>
            Add a more specific pattern variation under &ldquo;{canonicalPatternName}&rdquo;.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="e.g., Shrinkable Window"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                handleCreate();
              }
            }}
            disabled={loading}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={loading || !name.trim()}
          >
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
