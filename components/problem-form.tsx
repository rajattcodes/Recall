"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CanonicalPattern, CustomPattern } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ExternalLink, Loader2 } from "lucide-react";

/**
 * Zod schema for problem form validation
 */
const problemFormSchema = z.object({
  title: z.string().min(1, "Problem title is required"),
  leetcodeUrl: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.hostname.includes("leetcode.com");
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid LeetCode URL" }
    ),
  canonicalPatternId: z.string().min(1, "Please select a pattern category"),
  customPatternId: z.string().optional(),
});

export type ProblemFormValues = z.infer<typeof problemFormSchema>;

interface ProblemFormProps {
  canonicalPatterns: CanonicalPattern[];
  customPatterns: CustomPattern[];
  onSubmit: (values: ProblemFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<ProblemFormValues>;
  submitLabel?: string;
  showCustomPatternCreate?: boolean;
  onCreateCustomPattern?: () => void;
  onCanonicalChange?: (canonicalId: string) => void;
}

export function ProblemForm({
  canonicalPatterns,
  customPatterns,
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
  submitLabel = "Add Problem",
  showCustomPatternCreate = true,
  onCreateCustomPattern,
  onCanonicalChange,
}: ProblemFormProps) {
  const form = useForm<ProblemFormValues>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      leetcodeUrl: defaultValues?.leetcodeUrl || "",
      canonicalPatternId: defaultValues?.canonicalPatternId || "",
      customPatternId: defaultValues?.customPatternId || "",
    },
  });

  const selectedCanonicalPatternId = form.watch("canonicalPatternId");
  const leetcodeUrl = form.watch("leetcodeUrl");

  // Filter custom patterns by selected canonical pattern
  const filteredCustomPatterns = customPatterns.filter(
    (cp) => cp.canonicalPatternId === selectedCanonicalPatternId
  );

  const handleCanonicalChange = (value: string) => {
    form.setValue("canonicalPatternId", value);
    form.setValue("customPatternId", "");
    onCanonicalChange?.(value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Problem Title <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Two Sum"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LeetCode URL Field */}
        <FormField
          control={form.control}
          name="leetcodeUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                LeetCode URL <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="https://leetcode.com/problems/two-sum/"
                    className="pr-10"
                    disabled={isSubmitting}
                    {...field}
                  />
                  {leetcodeUrl && (
                    <a
                      href={leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Canonical Pattern Select */}
        <FormField
          control={form.control}
          name="canonicalPatternId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Pattern Category <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={handleCanonicalChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a pattern category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {canonicalPatterns.map((pattern) => (
                    <SelectItem key={pattern.id} value={pattern.id}>
                      {pattern.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Custom Pattern Select (only shows when canonical is selected) */}
        {selectedCanonicalPatternId && (
          <FormField
            control={form.control}
            name="customPatternId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Custom Pattern{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <div className="flex gap-2">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a custom pattern" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCustomPatterns.length > 0 ? (
                        filteredCustomPatterns.map((pattern) => (
                          <SelectItem key={pattern.id} value={pattern.id}>
                            {pattern.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-3 text-sm text-center text-muted-foreground">
                          No custom patterns yet
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {showCustomPatternCreate && onCreateCustomPattern && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCreateCustomPattern}
                      disabled={isSubmitting}
                    >
                      + New
                    </Button>
                  )}
                </div>
                <FormDescription>
                  Custom patterns help you organize variations of the main
                  pattern category.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={onCancel ? "flex-1" : "w-full"}
          >
            {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
