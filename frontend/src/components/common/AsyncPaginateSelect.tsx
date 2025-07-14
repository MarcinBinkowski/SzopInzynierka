import { AsyncPaginate } from "react-select-async-paginate";
import type { GroupBase, OptionsOrGroups } from "react-select";
import type { LoadOptions } from "react-select-async-paginate";

export interface OptionType {
  value: number;
  label: string;
}

interface AsyncPaginateSelectProps {
  value: OptionType | OptionType[] | null;
  onChange: (option: any) => void;
  isDisabled?: boolean;
  error?: string;
  placeholder?: string;
  isMulti?: boolean;
  fetcher: (params: { search: string; page: number }) => Promise<any>;
  mapOption: (item: any) => OptionType;
  defaultOptions: OptionType[];
  instanceId: string;
}

export function AsyncPaginateSelect({
  value,
  onChange,
  isDisabled,
  error,
  placeholder,
  isMulti,
  fetcher,
  mapOption,
  defaultOptions,
  instanceId,
}: AsyncPaginateSelectProps) {
  const loadOptions: LoadOptions<
    OptionType,
    GroupBase<OptionType>,
    { page: number }
  > = async (inputValue, _loadedOptions, additional) => {
    const page = additional?.page ?? 1;
    const data = await fetcher({ search: inputValue, page });

    const options: OptionsOrGroups<
      OptionType,
      GroupBase<OptionType>
    > = data.results?.map(mapOption) ?? [];

    return {
      options,
      hasMore: Boolean(data.next),
      additional: { page: page + 1 },
    };
  };

  return (
    <div>
      <AsyncPaginate<
        OptionType,
        GroupBase<OptionType>,
        { page: number },
        boolean
      >
        isMulti={isMulti}
        value={value as any}
        loadOptions={loadOptions}
        onChange={onChange}
        isClearable
        placeholder={placeholder}
        isDisabled={isDisabled}
        instanceId={instanceId}
        additional={{ page: 1 }}
        defaultOptions={defaultOptions}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
