import { createFileRoute } from '@tanstack/react-router'
import { GenericReadOnlyListPage } from '@/components/common/listPages'
import { useCheckoutInvoicesList } from '@/api/generated/shop/checkout/checkout'
import type { Invoice } from '@/api/generated/shop/schemas'

import { createDateColumn } from '@/components/common/listPageHelpers/columnHelpers'
import type { MRT_ColumnDef } from 'material-react-table'

const columns: MRT_ColumnDef<Invoice>[] = [
  {
    accessorKey: 'invoice_number',
    header: 'Invoice #',
    Cell: ({ cell }) => (
      <span className="font-mono font-medium">{cell.getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'order_number',
    header: 'Order',
    Cell: ({ cell }) => (
      <span className="font-mono">{cell.getValue<string>()}</span>
    ),
  },
  createDateColumn('created_at', 'Created'),
]

export const Route = createFileRoute('/_authenticated/checkout/invoices/')({
  component: InvoicesPage,
})

function InvoicesPage() {
  const useListHook = (params: any) => {
    const result = useCheckoutInvoicesList(params?.query)
    return {
      data: result.data,
      isLoading: result.isLoading,
      refetch: result.refetch || (() => {}),
    }
  }

  return (
    <GenericReadOnlyListPage
      title="Invoices"
      columns={columns}
      useListHook={useListHook}
      customRowActions={() => [
        {
          label: 'View',
          variant: 'outline',
          onClick: (r) => {
            console.log('View invoice:', (r as Invoice).id)
          },
        },
        {
          label: 'Download',
          variant: 'outline',
          onClick: (r) => {
            console.log('Download invoice:', (r as Invoice).id)
          },
        },
      ]}
    />
  )
}
