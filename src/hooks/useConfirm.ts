import { useConfirmDialogContext } from '@/components/ui/ConfirmDialogProvider';

export function useConfirm() {
  const { confirm } = useConfirmDialogContext();
  return confirm;
}
