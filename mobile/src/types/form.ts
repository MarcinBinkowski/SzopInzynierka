export interface SelectOption {
  value: number;
  label: string;
}

export type FieldType = 'text' | 'number' | 'date' | 'datetime' | 'select';

export interface FormField<T> {
  name: keyof T & string;
  label: string;
  type: FieldType;
  placeholder: string;
  required: boolean;
  keyboardType: 'default' | 'numeric' | 'email-address';
  validation?: (value: string) => string | undefined;
  options?: SelectOption[];
}

export interface FieldState {
  value: string;
  error?: string;
}

export type FormState<T> = Record<keyof T, FieldState>;