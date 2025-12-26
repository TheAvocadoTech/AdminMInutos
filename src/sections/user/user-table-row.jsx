import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableRow({
  selected,
  id,
  phoneNumber,
  isVerified,
  isAdmin,
  role,
  createdAt,
  updatedAt,
  handleClick,
  sx,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  console.log('UserTableRow - Phone Number:', phoneNumber);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected} sx={sx}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        {/* User ID */}
        <TableCell component="th" scope="row">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: '#dc2626' }}>
              {phoneNumber ? phoneNumber.slice(-2) : '??'}
            </Avatar>
            <Typography variant="subtitle2" noWrap>
              {id}
            </Typography>
          </Stack>
        </TableCell>

        {/* Phone Number */}
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {phoneNumber || 'N/A'}
          </Typography>
        </TableCell>

        {/* Verified Status */}
        <TableCell align="center">
          <Label color={isVerified ? 'success' : 'error'}>
            {isVerified ? 'Yes' : 'No'}
          </Label>
        </TableCell>

        {/* Admin Status */}
        <TableCell align="center">
          <Label color={isAdmin ? 'info' : 'default'}>
            {isAdmin ? 'Yes' : 'No'}
          </Label>
        </TableCell>

        {/* Role */}
        <TableCell align="center">
          <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
            {role || 'USER'}
          </Typography>
        </TableCell>

        {/* Created At */}
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {formatDate(createdAt)}
          </Typography>
        </TableCell>

        {/* Updated At */}
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {formatDate(updatedAt)}
          </Typography>
        </TableCell>

        {/* Actions */}
        <TableCell align="center">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={handleCloseMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  selected: PropTypes.bool,
  id: PropTypes.string,
  phoneNumber: PropTypes.string,
  isVerified: PropTypes.bool,
  isAdmin: PropTypes.bool,
  role: PropTypes.string,
  createdAt: PropTypes.string,
  updatedAt: PropTypes.string,
  handleClick: PropTypes.func,
  sx: PropTypes.object,
};