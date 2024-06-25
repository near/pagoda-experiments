import { Flex } from '@pagoda/ui/src/components/Flex';

import { convertFileListToPreviewUrls } from '@/utils/file';

type Props = {
  fileList: FileList | undefined;
};

export const FilePreviews = ({ fileList }: Props) => {
  const urls = convertFileListToPreviewUrls(fileList);

  if (urls.length === 0) return null;

  return (
    <Flex stack>
      {urls.map((url) => (
        <img key={url} src={url} alt="" />
      ))}
    </Flex>
  );
};
