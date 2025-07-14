import { AsyncPaginate, LoadOptions } from 'react-select-async-paginate';

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
  const loadOptions: LoadOptions<OptionType, any, { page?: number }> = async (
    inputValue,
    loadedOptions,
    { page = 1 } = {}
  ) => {
    const data = await fetcher({ search: inputValue, page });
    return {
      options: data.results?.map(mapOption) || [],
      hasMore: !!data.next,
      additional: { page: page + 1 },
    };
  };

  return (
    <div>
      <AsyncPaginate
        isMulti={isMulti}
        value={value}
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