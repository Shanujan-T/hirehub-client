"use client";

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type LabelHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { cn } from "@/lib/utils";

export const Form = FormProvider;

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
}

const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext.name) {
    throw new Error("useFormField must be used within FormField");
  }

  return {
    id: itemContext.id,
    name: fieldContext.name,
    error: fieldState.error?.message,
    ...fieldState,
  };
}

const FormItemContext = createContext<{ id: string }>({ id: "" });

export function FormItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const id = useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

export function FormLabel({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  const { error, id } = useFormField();
  return (
    <label
      htmlFor={id}
      className={cn(
        "text-sm font-medium text-heading",
        error && "text-[#DA3753]",
        className,
      )}
      {...props}
    />
  );
}

export function FormControl({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { error, id } = useFormField();
  return (
    <div
      id={id}
      className={cn(className)}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
}

export function FormMessage({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error } = useFormField();
  if (!error) return null;
  return (
    <p
      className={cn("text-xs text-[#DA3753]", className)}
      role="alert"
      {...props}
    >
      {String(error)}
    </p>
  );
}

export const Label = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium text-heading",
      className,
    )}
    {...props}
  />
));

Label.displayName = "Label";

interface ParsedOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

function parseOptionChildren(children: ReactNode): ParsedOption[] {
  const options: ParsedOption[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== "option") return;
    const el = child as ReactElement<{
      value?: string | number;
      disabled?: boolean;
      children?: ReactNode;
    }>;
    options.push({
      value: String(el.props.value ?? ""),
      label: el.props.children ?? el.props.value ?? "",
      disabled: el.props.disabled,
    });
  });

  return options;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, value, defaultValue, onChange, onBlur, disabled, id, name, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<string>(
      () => String(value ?? defaultValue ?? ""),
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);
    const options = parseOptionChildren(children);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? String(value) : internalValue;

    useImperativeHandle(ref, () => selectRef.current as HTMLSelectElement);

    useEffect(() => {
      if (isControlled) return;
      if (defaultValue !== undefined) {
        setInternalValue(String(defaultValue));
      }
    }, [defaultValue, isControlled]);

    useEffect(() => {
      if (!open) return;
      function handlePointerDown(event: MouseEvent) {
        if (!containerRef.current?.contains(event.target as Node)) {
          setOpen(false);
          onBlur?.({ target: selectRef.current } as React.FocusEvent<HTMLSelectElement>);
        }
      }
      document.addEventListener("mousedown", handlePointerDown);
      return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [open, onBlur]);

    const commitValue = useCallback(
      (nextValue: string) => {
        if (!isControlled) setInternalValue(nextValue);
        if (selectRef.current) {
          selectRef.current.value = nextValue;
          const nativeEvent = new Event("change", { bubbles: true });
          selectRef.current.dispatchEvent(nativeEvent);
        }
        onChange?.({
          target: { value: nextValue, name: name ?? "" },
          currentTarget: { value: nextValue, name: name ?? "" },
        } as React.ChangeEvent<HTMLSelectElement>);
        setOpen(false);
      },
      [isControlled, name, onChange],
    );

    const selectedOption = options.find((opt) => opt.value === currentValue);
    const displayLabel = selectedOption?.label ?? options[0]?.label ?? "Select…";

    const triggerClassName = cn(
      "flex h-10 w-full items-center justify-between rounded-lg border border-default bg-surface-card px-3 py-2 text-left text-sm text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] disabled:cursor-not-allowed disabled:opacity-50",
      error && "border-[#DA3753] focus-visible:ring-[#DA3753]",
      className,
    );

    return (
      <div className="relative w-full" ref={containerRef}>
        <select
          ref={selectRef}
          id={id}
          name={name}
          value={currentValue}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          {...props}
        >
          {children}
        </select>

        <button
          type="button"
          id={id ? `${id}-trigger` : undefined}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={id}
          className={triggerClassName}
          onClick={() => {
            if (disabled) return;
            setOpen((prev) => !prev);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((prev) => !prev);
            }
          }}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-subtle transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        {open ? (
          <ul
            role="listbox"
            className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-default bg-surface-card p-1.5 shadow-[var(--shadow-card)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(12,12,22,0.96)]"
          >
            {options.map((option) => {
              const isSelected = option.value === currentValue;
              return (
                <li key={`${option.value}-${String(option.label)}`} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    disabled={option.disabled}
                    className={cn(
                      "group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150",
                      option.disabled && "cursor-not-allowed opacity-40",
                      !option.disabled && !isSelected && "text-heading hover:bg-gradient-to-r hover:from-indigo-500/10 hover:via-purple-500/15 hover:to-pink-500/10 hover:pl-[calc(0.75rem-2px)] hover:border-l-2 hover:border-[var(--brand-blue)]",
                      isSelected &&
                        "border-l-2 border-[var(--brand-blue)] bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/10 pl-[calc(0.75rem-2px)] font-semibold text-heading",
                    )}
                    onClick={() => {
                      if (option.disabled) return;
                      commitValue(option.value);
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? (
                      <Check className="h-4 w-4 shrink-0 text-[var(--brand-blue)] dark:text-[#22d3ee]" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {error ? (
          <p className="mt-1 text-xs text-[#DA3753]" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";

export function FormRoot<T extends FieldValues>({
  form,
  children,
  className,
  onSubmit,
}: {
  form: UseFormReturn<T>;
  children: React.ReactNode;
  className?: string;
  onSubmit: (values: T) => void | Promise<void>;
}) {
  return (
    <FormProvider {...form}>
      <form
        className={className}
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}

export default Form;
