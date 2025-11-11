import * as React from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import FolderSpecialOutlinedIcon from '@mui/icons-material/FolderSpecialOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import DevicesOtherOutlinedIcon from '@mui/icons-material/DevicesOtherOutlined';

export const getFolderIcon = (variant = 'default', size = 'small') => {
  if (variant === 'drive') {
    return <FolderSpecialOutlinedIcon color="primary" fontSize={size} />;
  }
  if (variant === 'root') {
    return <DevicesOtherOutlinedIcon color="primary" fontSize={size} />;
  }
  return <FolderIcon color="primary" fontSize={size} />;
};

export const getFileIcon = (fileType = '', size = 'small') => {
  const normalizedType = fileType.toLowerCase();
  if (normalizedType.startsWith('audio/')) {
    return <MusicNoteOutlinedIcon color="secondary" fontSize={size} />;
  }
  if (normalizedType.startsWith('image/')) {
    return <ImageOutlinedIcon color="primary" fontSize={size} />;
  }
  if (normalizedType.startsWith('video/')) {
    return <VideocamOutlinedIcon color="error" fontSize={size} />;
  }
  if (normalizedType.includes('pdf') || normalizedType.includes('word') || normalizedType.includes('excel')) {
    return <DescriptionOutlinedIcon color="action" fontSize={size} />;
  }
  return <InsertDriveFileOutlinedIcon color="disabled" fontSize={size} />;
};

