'use client';

import { useState } from 'react';

export function useSectionTitleEdit(isTitleEditable: boolean) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  function beginTitleEdit() {
    if (!isTitleEditable) {
      return;
    }

    setIsEditingTitle(true);
  }

  function endTitleEdit() {
    setIsEditingTitle(false);
  }

  return {
    isEditingTitle,
    beginTitleEdit,
    endTitleEdit,
  };
}
