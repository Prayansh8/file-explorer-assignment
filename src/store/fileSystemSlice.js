import { createSlice, nanoid } from '@reduxjs/toolkit';
import rawData from '../data/data.json';

const cloneTree = (node) => {
  if (!node) {
    return null;
  }
  const children = Array.isArray(node.children)
    ? node.children.map((child) => cloneTree(child))
    : [];
  return { ...node, children };
};

const findNodeWithParent = (node, targetId, parent = null) => {
  if (!node) {
    return null;
  }
  if (node.id === targetId) {
    return { node, parent };
  }
  if (!Array.isArray(node.children)) {
    return null;
  }
  for (const child of node.children) {
    const match = findNodeWithParent(child, targetId, node);
    if (match) {
      return match;
    }
  }
  return null;
};

const getFirstFolderId = (node) => {
  if (!node) {
    return null;
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child.entryType === 'folder') {
        return child.id;
      }
    }
  }
  return node.id;
};

const hasNameConflict = (parentNode, candidateName, excludedId = null) => {
  if (!parentNode || !Array.isArray(parentNode.children)) {
    return false;
  }
  return parentNode.children.some((child) => {
    if (excludedId && child.id === excludedId) {
      return false;
    }
    return child.name.trim().toLowerCase() === candidateName.trim().toLowerCase();
  });
};

const ensureChildrenArray = (node) => {
  if (!node.children) {
    node.children = [];
  }
  return node.children;
};

const removeChild = (parentNode, childId) => {
  if (!parentNode || !Array.isArray(parentNode.children)) {
    return;
  }
  const index = parentNode.children.findIndex((child) => child.id === childId);
  if (index !== -1) {
    parentNode.children.splice(index, 1);
  }
};

const buildInitialState = () => {
  const root = cloneTree(rawData);
  const rootId = root?.id ?? 'root';
  const defaultFolderId = getFirstFolderId(root);
  const expandedIds = new Set([rootId, defaultFolderId].filter(Boolean));

  return {
    root,
    rootId,
    expandedIds: Array.from(expandedIds),
    currentFolderId: defaultFolderId,
    selectedEntryId: null,
    lastError: null
  };
};

const initialState = buildInitialState();

const fileSystemSlice = createSlice({
  name: 'fileSystem',
  initialState,
  reducers: {
    setExpandedIds(state, action) {
      state.expandedIds = Array.isArray(action.payload) ? action.payload : [];
    },
    setCurrentFolder(state, action) {
      const folderId = action.payload;
      const match = findNodeWithParent(state.root, folderId);
      if (!match || match.node.entryType !== 'folder') {
        state.lastError = 'Unable to locate the selected folder.';
        return;
      }
      state.currentFolderId = folderId;
      state.selectedEntryId = null;
      state.lastError = null;
    },
    selectEntry(state, action) {
      const entryId = action.payload;
      if (!entryId) {
        state.selectedEntryId = null;
        return;
      }
      const match = findNodeWithParent(state.root, entryId);
      if (!match) {
        state.lastError = 'Unable to locate the selected item.';
        return;
      }
      state.selectedEntryId = entryId;
      if (match.node.entryType === 'file' && match.parent) {
        state.currentFolderId = match.parent.id;
      }
      state.lastError = null;
    },
    createEntry(state, action) {
      const { parentId, entryType, name, fileType = 'Document/txt', content = '' } =
        action.payload ?? {};

      if (!parentId || !name) {
        state.lastError = 'A name and parent folder are required.';
        return;
      }

      const match = findNodeWithParent(state.root, parentId);
      if (!match || match.node.entryType !== 'folder') {
        state.lastError = 'Entries can only be created inside folders.';
        return;
      }

      if (hasNameConflict(match.node, name)) {
        state.lastError = 'An item with the same name already exists in this folder.';
        return;
      }

      const newEntry = {
        id: nanoid(),
        name: name.trim(),
        entryType: entryType === 'folder' ? 'folder' : 'file',
        dateModified: new Date().toISOString().slice(0, 10)
      };

      if (newEntry.entryType === 'folder') {
        newEntry.children = [];
      } else {
        newEntry.fileType = fileType;
        newEntry.size = '—';
        newEntry.content = content;
      }

      ensureChildrenArray(match.node).push(newEntry);
      state.expandedIds = Array.from(new Set([...state.expandedIds, parentId]));
      state.currentFolderId = parentId;
      state.selectedEntryId = newEntry.id;
      state.lastError = null;
    },
    renameEntry(state, action) {
      const { id, newName } = action.payload ?? {};
      if (!id || !newName) {
        state.lastError = 'A new name is required to rename an item.';
        return;
      }
      const match = findNodeWithParent(state.root, id);
      if (!match) {
        state.lastError = 'Unable to find the item to rename.';
        return;
      }
      if (hasNameConflict(match.parent ?? match.node, newName, id)) {
        state.lastError = 'Another item with that name already exists in this location.';
        return;
      }
      match.node.name = newName.trim();
      match.node.dateModified = new Date().toISOString().slice(0, 10);
      state.lastError = null;
    },
    deleteEntry(state, action) {
      const { id } = action.payload ?? {};
      if (!id) {
        state.lastError = 'Select an item to delete.';
        return;
      }
      if (id === state.rootId) {
        state.lastError = 'The root cannot be deleted.';
        return;
      }
      const match = findNodeWithParent(state.root, id);
      if (!match || !match.parent) {
        state.lastError = 'Unable to delete the selected item.';
        return;
      }
      removeChild(match.parent, id);
      if (state.selectedEntryId === id) {
        state.selectedEntryId = null;
      }
      if (state.currentFolderId === id) {
        state.currentFolderId = match.parent.id;
      }
      state.lastError = null;
    },
    clearError(state) {
      state.lastError = null;
    }
  }
});

export const {
  setExpandedIds,
  setCurrentFolder,
  selectEntry,
  createEntry,
  renameEntry,
  deleteEntry,
  clearError
} = fileSystemSlice.actions;

export const selectRoot = (state) => state.fileSystem.root;
export const selectRootId = (state) => state.fileSystem.rootId;
export const selectExpandedIds = (state) => state.fileSystem.expandedIds;
export const selectCurrentFolderId = (state) => state.fileSystem.currentFolderId;
export const selectSelectedEntryId = (state) => state.fileSystem.selectedEntryId;
export const selectLastError = (state) => state.fileSystem.lastError;

export default fileSystemSlice.reducer;

