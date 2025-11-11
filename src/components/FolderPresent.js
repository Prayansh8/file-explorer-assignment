import React, { useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { getFolderIcon, getFileIcon } from '../utils/iconFactory';

const getFolderDetails = (folder) => {
  const children = Array.isArray(folder.children) ? folder.children : [];
  const childFolders = children.filter((item) => item.entryType === 'folder').length;
  const childFiles = children.filter((item) => item.entryType === 'file').length;
  if (childFolders > 0 && childFiles > 0) {
    return `${childFolders} folders • ${childFiles} files`;
  }
  if (childFolders > 0) {
    return `${childFolders} folders`;
  }
  if (childFiles > 0) {
    return `${childFiles} files`;
  }
  return 'Empty folder';
};

const sortFiles = (files, order) => {
  return [...files].sort((a, b) => {
    const dateA = new Date(a.dateModified);
    const dateB = new Date(b.dateModified);
    if (Number.isNaN(dateA.getTime()) || Number.isNaN(dateB.getTime())) {
      return 0;
    }
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

export default function FolderPresent({ folder, listView, selectedFileId, onFolderOpen, onFileSelect }) {
  const [showDetails, setShowDetails] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');
 
  const entries = React.useMemo(() => {
    if (!folder || !Array.isArray(folder.children)) {
      return [];
    }
    return folder.children;
  }, [folder]);

  const directories = React.useMemo(() => entries.filter((item) => item.entryType === 'folder'), [entries]);
  const files = React.useMemo(() => entries.filter((item) => item.entryType === 'file'), [entries]);
  const sortedFiles = React.useMemo(() => sortFiles(files, sortOrder), [files, sortOrder]);

  const handleSortByDate = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (!folder) {
    return (
      <Box sx={{ py: 6 }}>
        <Typography variant="h6">Select a folder to view its contents.</Typography>
      </Box>
    );
  }



  return (
    <Box sx={{ flexGrow: 1 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">{folder.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {getFolderDetails(folder)}
          </Typography>
        </Box>
        <Chip label={listView ? 'List view' : 'Grid view'} size="small" />
      </Stack>

      <FormGroup row sx={{ mb: 2, alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showDetails}
              onChange={(event) => setShowDetails(event.target.checked)}
            />
          }
          label="Show Details"
        />
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">Sort by date modified</Typography>
          <IconButton onClick={handleSortByDate} size="small" sx={{ ml: 0.5 }}>
            {sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />}
          </IconButton>
        </Box>
      </FormGroup>

      {entries.length === 0 ? (
        <Typography variant="body1">This folder is empty.</Typography>
      ) : listView ? (
        <List dense="true">
          {directories.map((directory) => (
            <ListItem disablePadding key={directory.id}>
              <ListItemButton onClick={() => onFolderOpen && onFolderOpen(directory.id)}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getFolderIcon('default', 'medium')}
                </ListItemIcon>
                <ListItemText
                  primary={directory.name}
                  secondary={showDetails ? getFolderDetails(directory) : null}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {sortedFiles.map((file) => (
            <ListItem disablePadding key={file.id}>
              <ListItemButton
                selected={selectedFileId === file.id}
                onClick={() => onFileSelect && onFileSelect(file.id)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getFileIcon(file.fileType, 'medium')}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={showDetails ? `${file.size} • Modified ${file.dateModified}` : null}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Grid container spacing={2}>
          {directories.map((directory) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={directory.id}>
              <Card variant="outlined">
                <CardActionArea onClick={() => onFolderOpen && onFolderOpen(directory.id)}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getFolderIcon('default', 'large')}
                      <Typography variant="subtitle1" noWrap>{directory.name}</Typography>
                    </Box>
                    {showDetails && (
                      <Typography variant="body2" color="text.secondary">
                        {getFolderDetails(directory)}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
          {sortedFiles.map((file) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: selectedFileId === file.id ? 'primary.main' : 'divider',
                  backgroundColor: selectedFileId === file.id ? 'action.hover' : 'background.paper'
                }}
              >
                <CardActionArea onClick={() => onFileSelect && onFileSelect(file.id)}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getFileIcon(file.fileType, 'large')}
                      <Typography variant="subtitle1" noWrap>{file.name}</Typography>
                    </Box>
                    {showDetails && (
                      <Typography variant="body2" color="text.secondary">
                        {file.size} • Modified {file.dateModified}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
