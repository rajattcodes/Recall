"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CanonicalPattern,
  CreateProblemRequest,
  CustomPattern,
} from "@/lib/types/api";
import { ProblemForm, type ProblemFormValues } from "@/components/problem-form";
import { CreatePatternDialog } from "@/components/create-pattern-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface AddProblemClientProps {
  initialCanonicalPatterns: CanonicalPattern[];
  initialCustomPatterns: CustomPattern[];
  initialPatternId?: string | null;
}

export function AddProblemClient({
  initialCanonicalPatterns,
  initialCustomPatterns,
  initialPatternId = null,
}: AddProblemClientProps) {
  const router = useRouter();
  const [canonicalPatterns] = useState<CanonicalPattern[]>(
    initialCanonicalPatterns
  );
  const [customPatterns, setCustomPatterns] = useState<CustomPattern[]>(
    initialCustomPatterns
  );
  const [submitting, setSubmitting] = useState(false);
  const [selectedCanonicalId, setSelectedCanonicalId] = useState<string>(
    initialPatternId ?? ""
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (values: ProblemFormValues) => {
    setSubmitting(true);

    try {
      const payload: CreateProblemRequest = {
        title: values.title.trim(),
        leetcodeUrl: values.leetcodeUrl.trim(),
        canonicalPatternId: values.canonicalPatternId,
        customPatternId: values.customPatternId || null,
      };

      const response = await fetch("/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create problem");
      }

      toast.success("Problem added successfully!");
      router.push("/today");
    } catch (error: any) {
      console.error("Error creating problem:", error);
      toast.error(error.message || "Failed to create problem");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePatternCreated = (newPattern: CustomPattern) => {
    setCustomPatterns((prev) => [...prev, newPattern]);
  };

  const selectedCanonicalPattern = canonicalPatterns.find(
    (p) => p.id === selectedCanonicalId
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Problem Details
          </CardTitle>
          <CardDescription>
            Enter the problem information to start tracking your progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProblemForm
            canonicalPatterns={canonicalPatterns}
            customPatterns={customPatterns}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isSubmitting={submitting}
            submitLabel="Add Problem"
            showCustomPatternCreate={true}
            onCreateCustomPattern={() => setDialogOpen(true)}
            onCanonicalChange={setSelectedCanonicalId}
            defaultValues={
              initialPatternId
                ? { canonicalPatternId: initialPatternId }
                : undefined
            }
          />
        </CardContent>
      </Card>

      {selectedCanonicalId && selectedCanonicalPattern && (
        <CreatePatternDialog
          canonicalPatternId={selectedCanonicalId}
          canonicalPatternName={selectedCanonicalPattern.name}
          onCreated={handlePatternCreated}
        />
      )}

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-mono text-primary">1.</span>
              Add a problem and it will be scheduled for review in 3 days.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-primary">2.</span>
              If you solve it correctly, the next review is in 10 days, then 30.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-primary">3.</span>
              After passing all stages, the problem is marked as mastered!
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-primary">4.</span>
              If you fail, the cycle resets to help reinforce the pattern.
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
