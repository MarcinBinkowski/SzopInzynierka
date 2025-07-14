import type { MRT_ColumnDef } from "material-react-table";

export function createBooleanColumn(
  accessorKey: string,
  header: string,
  options?: {
    trueText?: string;
    falseText?: string;
  },
): MRT_ColumnDef<any> {
  const { trueText = "Yes", falseText = "No" } = options || {};

  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value ? trueText : falseText;
    },
  };
}

export function createPriceColumn(
  accessorKey: string,
  header: string,
  options?: {
    currency?: string;
  },
): MRT_ColumnDef<any> {
  const { currency = "€" } = options || {};

  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      if (!value) return "N/A";
      return `${currency}${parseFloat(value as string).toFixed(2)}`;
    },
  };
}

export function createDateColumn(
  accessorKey: string,
  header: string,
  options: {
    enableSorting?: boolean;
  } = {},
): MRT_ColumnDef<any> {
  return {
    accessorKey,
    header,
    enableSorting: options.enableSorting ?? true,
    Cell: ({ cell }) => {
      const date = cell.getValue();
      if (!date || typeof date !== "string") return "N/A";

      const parsed = Date.parse(date);
      if (isNaN(parsed)) return "N/A";

      const dateObj = new Date(parsed);

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },
  };
}

export function createTruncatedTextColumn(
  accessorKey: string,
  header: string,
  options?: {
    maxLength?: number;
    emptyText?: string;
  },
): MRT_ColumnDef<any> {
  const { maxLength = 80, emptyText = "" } = options || {};

  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      if (!value) return emptyText;
      const text = String(value);
      return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    },
  };
}

export function createPercentageColumn(
  accessorKey: string,
  header: string,
): MRT_ColumnDef<any> {
  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      if (!value) return "";
      return `${value}%`;
    },
  };
}

export function createStatusColumn(
  accessorKey: string,
  header: string,
  options?: {
    emptyText?: string;
  },
): MRT_ColumnDef<any> {
  const { emptyText = "N/A" } = options || {};

  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : emptyText;
    },
  };
}

export function createImageColumn(
  accessorKey: string,
  header: string,
  options?: {
    width?: number;
    height?: number;
    borderRadius?: number;
    alt?: string;
    fallback?: string | null;
  },
): MRT_ColumnDef<any> {
  const {
    width = 40,
    height = 40,
    borderRadius = 4,
    alt = "Image",
    fallback = null,
  } = options || {};

  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const url = cell.getValue() as string | null | undefined;

      if (!url) return fallback;

      return (
        <img
          src={url}
          alt={alt}
          style={{
            width,
            height,
            objectFit: "cover" as const,
            borderRadius,
            border: "1px solid #e0e0e0",
          }}
        />
      );
    },
  };
}

export function createRelationColumn(
  accessorKey: string,
  header: string,
  options?: {
    nameField?: string;
    emptyText?: string;
  },
): MRT_ColumnDef<any> {
  const { nameField = "name", emptyText = "" } = options || {};

  return {
    accessorKey,
    header,
    Cell: ({ cell }) => {
      const obj = cell.getValue();

      if (!obj || typeof obj !== "object") return emptyText;

      const name = (obj as any)[nameField];
      return name || emptyText;
    },
  };
}
