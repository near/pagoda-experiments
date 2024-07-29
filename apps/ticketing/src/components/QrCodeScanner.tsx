import { openToast, useDebouncedFunction } from '@near-pagoda/ui';
import { Spinner } from '@phosphor-icons/react';
import QrScanner from 'qr-scanner';
import { useEffect, useRef } from 'react';

import s from './QrCodeScanner.module.scss';

type Props = {
  onScanSuccess: (data: string) => any;
  processing: boolean;
};

export const QrCodeScanner = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner>();
  const lastScannedDataRef = useRef('');

  /*
    NOTE: This handler will trigger every X seconds based on maxScansPerSecond 
    as long as there is a valid QR code in the camera. We use a leading debounce 
    to emit a single success event per QR code:
  */
  const onScanSuccess = useDebouncedFunction(
    (result: QrScanner.ScanResult) => {
      props.onScanSuccess(result.data);
    },
    1000,
    true,
  );

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        onScanSuccess(result);

        if (lastScannedDataRef.current !== result.data) {
          /*
            NOTE: We flush the debounced handler in the case that we're quickly scanning 
            multiple, unique QR codes.
          */
          onScanSuccess.flush();
          lastScannedDataRef.current = result.data;
        }
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
        returnDetailedScanResult: true,
        onDecodeError: (error) => {
          /*
            NOTE: This handler will trigger every X seconds based on maxScansPerSecond 
            as long as there is an invalid QR code in the camera. So this gets pretty 
            noisy - maybe we consider omitting the console.warn() entirely?
          */
          console.warn(error);
        },
      },
    );

    scannerRef.current = scanner;

    const start = async () => {
      try {
        await scanner.start();
      } catch (error) {
        console.error(error);
        openToast({
          type: 'error',
          title: 'Failed to start scanner',
          description: 'Reload this page and try again',
          action: () => window.location.reload(),
          actionText: 'Reload',
        });
      }
    };

    start();

    return () => {
      scanner.stop();
      scanner.destroy();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={s.scanner} data-processing={props.processing}>
      <video className={s.video} ref={videoRef} />
      <div className={s.spinner}>
        <Spinner />
      </div>
    </div>
  );
};
