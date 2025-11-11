import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TreeItem from '@mui/lab/TreeItem';
import MenuIcon from '@mui/icons-material/Menu';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import fileSystemData from '../data/data.json';
import FolderPresent from '../components/FolderPresent';
import { getFolderIcon, getFileIcon } from '../utils/iconFactory';

const drawerWidth = 0;
const rootId = fileSystemData.id;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: open ? 0 : `-${drawerWidth}px`
  })
);

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
    })
  })
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end'
}));

const buildFileSystemIndex = (root) => {
  const map = new Map();
  let firstFolder = null;

  const traverse = (node, parentId = null) => {
    const entry = { ...node, parentId };
    map.set(entry.id, entry);
    if (entry.entryType === 'folder' && parentId && !firstFolder) {
      firstFolder = entry.id;
    }
    if (Array.isArray(entry.children)) {
      entry.children.forEach((child) => traverse(child, entry.id));
    }
  };

  traverse(root);
  if (!firstFolder) {
    firstFolder = root.id;
  }

  return { map, firstFolder};
};

const getFolderVariant = (node, map) => {
  if (node.id === rootId) {
    return 'root';
  }
  const parentId = map.get(node.id)?.parentId;
  if (parentId === rootId) {
    return 'drive';
  }
  return 'default';
};

export default function Header() {
  const { map: nodeMap, firstFolder } = React.useMemo(
    () => buildFileSystemIndex(fileSystemData),
    []
  );
  const [open, setOpen] = React.useState(true);
  const [currentFolderId, setCurrentFolderId] = React.useState(firstFolder);
  const [selectedFileId, setSelectedFileId] = React.useState(null);
  const [listView, setListView] = React.useState(true);


  const ensureExpandedPath = React.useCallback(
    (targetId) => {
      const nodesToExpand = [];
      let current = targetId;
      while (current) {
        const entry = nodeMap.get(current);
        if (!entry) {
          break;
        }
        if (entry.entryType === 'folder') {
          nodesToExpand.push(entry.id);
        }
        if (entry.parentId) {
          nodesToExpand.push(entry.parentId);
        }
        current = entry.parentId;
      }
    },
    [nodeMap]
  );

  const handleFolderOpen = React.useCallback(
    (folderId) => {
      const node = nodeMap.get(folderId);
      if (!node || node.entryType !== 'folder') {
        return;
      }
      ensureExpandedPath(folderId);
      setCurrentFolderId(folderId);
      setSelectedFileId(null);
    },
    [ensureExpandedPath, nodeMap]
  );

  const handleFileSelect = React.useCallback(
    (fileId) => {
      const node = nodeMap.get(fileId);
      if (!node || node.entryType !== 'file') {
        return;
      }
      ensureExpandedPath(fileId);
      setSelectedFileId(fileId);
      if (node.parentId) {
        setCurrentFolderId(node.parentId);
      }
    },
    [ensureExpandedPath, nodeMap]
  );


  const breadcrumbs = React.useMemo(() => {
    const trail = [];
    let current = currentFolderId;
    while (current) {
      const node = nodeMap.get(current);
      if (!node) {
        break;
      }
      trail.unshift(node);
      current = node.parentId;
    }
    return trail;
  }, [currentFolderId, nodeMap]);

  const renderTree = React.useCallback(
    (node) => (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            {node.entryType === 'folder'
              ? getFolderIcon(getFolderVariant(node, nodeMap))
              : getFileIcon(node.fileType)}
            <Typography variant="body2">{node.name}</Typography>
          </Stack>
        }
      >
        {Array.isArray(node.children)
          ? node.children.map((child) => {
            const indexedChild = nodeMap.get(child.id) || child;
            return renderTree(indexedChild);
          })
          : null}
      </TreeItem>
    ),
    [nodeMap]
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(true)}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1, color: 'inherit' }}>
            {breadcrumbs.map((node, index) => {
              const isLast = index === breadcrumbs.length - 1;
              if (isLast) {
                return (
                  <Typography key={node.id} color="inherit" variant="h6">
                    {node.name}
                  </Typography>
                );
              }
              return (
                <Link
                  key={node.id}
                  color="inherit"
                  underline="hover"
                  onClick={() => handleFolderOpen(node.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  {node.name}
                </Link>
              );
            })}
          </Breadcrumbs>
          <IconButton color="inherit" onClick={() => setListView((prev) => !prev)}>
            {listView ? <ViewModuleIcon /> : <ViewListIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Main open={open}>
        <DrawerHeader />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FolderPresent
            folder={nodeMap.get(currentFolderId)}
            listView={listView}
            selectedFileId={selectedFileId}
            onFolderOpen={handleFolderOpen}
            onFileSelect={handleFileSelect}
          />
        </Box>
      </Main>
    </Box>
  );
}
