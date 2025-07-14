import { useState } from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useTheme } from '@mui/material/styles'

interface Action {
  label: string
  onClick: (row: any) => void
  variant?: 'default' | 'destructive'
}

interface RowActionsProps {
  row: any
  actions: Action[]
}

export function RowActions({ row, actions }: RowActionsProps) {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleAction = (action: Action) => {
    handleClose()
    action.onClick(row)
  }

  return (
    <>
      <IconButton
        aria-label="actions"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => handleAction(action)}
            sx={action.variant === 'destructive' ? { color: theme.palette.error.main } : {}}
          >
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
} 