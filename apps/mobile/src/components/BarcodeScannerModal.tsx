import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string, type?: string) => void;
  title?: string;
  subtitle?: string;
}

export default function BarcodeScannerModal({
  visible,
  onClose,
  onScan,
  title = 'Scanna streckkod',
  subtitle = 'Rikta kameran mot streckkoden på produkten',
}: BarcodeScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanned, setIsScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsScanned(false);
      setTorch(false);
    }
  }, [visible]);

  const handleBarcodeScanned = ({ data, type }: { data: string; type: string }) => {
    if (isScanned) return;
    setIsScanned(true);

    // Haptic feedback
    try {
      Vibration.vibrate(80);
    } catch {
      // Ignore vibration errors if unsupported
    }

    onScan(data, type);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {!permission ? (
          <View style={styles.centerContent}>
            <Text style={styles.statusText}>Laddar kameran...</Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.centerContent}>
            <Text style={styles.permissionTitle}>Kameraåtkomst behövs</Text>
            <Text style={styles.permissionDescription}>
              För att scanna streckkoder med mobilen behöver appen tillgång till kameran.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Tillåt kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.closeButton, { marginTop: 15 }]} onPress={onClose}>
              <Text style={styles.closeButtonText}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            enableTorch={torch}
            barcodeScannerSettings={{
              barcodeTypes: [
                'ean13',
                'ean8',
                'upc_a',
                'upc_e',
                'code128',
                'code39',
                'qr',
                'itf14',
                'codabar',
              ],
            }}
            onBarcodeScanned={isScanned ? undefined : handleBarcodeScanned}
          >
            {/* Overlay UI */}
            <View style={styles.overlay}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>

              {/* Viewfinder Reticle */}
              <View style={styles.reticleContainer}>
                <View style={styles.reticle}>
                  {/* Corner accents */}
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                  <View style={styles.laserLine} />
                </View>
              </View>

              {/* Controls */}
              <View style={styles.footerControls}>
                <TouchableOpacity
                  style={[styles.controlButton, torch && styles.controlButtonActive]}
                  onPress={() => setTorch((prev) => !prev)}
                >
                  <Text style={styles.controlButtonText}>
                    {torch ? '🔦 Lampa: På' : '💡 Lampa: Av'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>✕ Stäng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#111',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionDescription: {
    color: '#bbb',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#4188d8',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  reticleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticle: {
    width: 270,
    height: 180,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#f37f06',
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  laserLine: {
    width: '90%',
    height: 2,
    backgroundColor: '#ee0c00',
    opacity: 0.8,
  },
  footerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  controlButtonActive: {
    backgroundColor: '#f37f06',
    borderColor: '#f37f06',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
