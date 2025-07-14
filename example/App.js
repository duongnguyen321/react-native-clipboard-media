import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';

import MediaClipboard from 'react-native-media-clipboard';

const App = () => {
  const [textInput, setTextInput] = useState('Hello, World!');
  const [clipboardContent, setClipboardContent] = useState(null);

  const copyText = async () => {
    try {
      await MediaClipboard.copyText(textInput);
      Alert.alert('Success', 'Text copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', `Failed to copy text: ${error.message}`);
    }
  };

  const copyImage = async () => {
    try {
      // Example image path - in a real app, this would come from image picker
      const imagePath = '/path/to/your/image.jpg';
      await MediaClipboard.copyImage(imagePath);
      Alert.alert('Success', 'Image copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', `Failed to copy image: ${error.message}`);
    }
  };

  const copyVideo = async () => {
    try {
      // Example video path - in a real app, this would come from media picker
      const videoPath = '/path/to/your/video.mp4';
      await MediaClipboard.copyVideo(videoPath);
      Alert.alert('Success', 'Video copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', `Failed to copy video: ${error.message}`);
    }
  };

  const copyPDF = async () => {
    try {
      // Example PDF path - in a real app, this would come from file picker
      const pdfPath = '/path/to/your/document.pdf';
      await MediaClipboard.copyPDF(pdfPath);
      Alert.alert('Success', 'PDF copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', `Failed to copy PDF: ${error.message}`);
    }
  };

  const copyAudio = async () => {
    try {
      // Example audio path - in a real app, this would come from media picker
      const audioPath = '/path/to/your/audio.mp3';
      await MediaClipboard.copyAudio(audioPath);
      Alert.alert('Success', 'Audio copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', `Failed to copy audio: ${error.message}`);
    }
  };

  const checkClipboardContent = async () => {
    try {
      const hasContent = await MediaClipboard.hasContent();
      if (hasContent) {
        const content = await MediaClipboard.getContent();
        setClipboardContent(content);
        Alert.alert(
          'Clipboard Content',
          `Type: ${content.type}\nData: ${content.data || 'Binary data'}`,
        );
      } else {
        Alert.alert('Clipboard', 'Clipboard is empty');
        setClipboardContent(null);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to check clipboard: ${error.message}`);
    }
  };

  const clearClipboard = async () => {
    try {
      await MediaClipboard.clear();
      setClipboardContent(null);
      Alert.alert('Success', 'Clipboard cleared!');
    } catch (error) {
      Alert.alert('Error', `Failed to clear clipboard: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>React Native Media Clipboard</Text>
          <Text style={styles.subtitle}>Example App</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Copy Text</Text>
          <TextInput
            style={styles.textInput}
            value={textInput}
            onChangeText={setTextInput}
            placeholder="Enter text to copy"
          />
          <TouchableOpacity style={styles.button} onPress={copyText}>
            <Text style={styles.buttonText}>Copy Text</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Copy Media Files</Text>
          <TouchableOpacity style={styles.button} onPress={copyImage}>
            <Text style={styles.buttonText}>Copy Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={copyVideo}>
            <Text style={styles.buttonText}>Copy Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={copyPDF}>
            <Text style={styles.buttonText}>Copy PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={copyAudio}>
            <Text style={styles.buttonText}>Copy Audio</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clipboard Management</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={checkClipboardContent}
          >
            <Text style={styles.buttonText}>Check Clipboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={clearClipboard}>
            <Text style={styles.buttonText}>Clear Clipboard</Text>
          </TouchableOpacity>
        </View>

        {clipboardContent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Clipboard Content</Text>
            <View style={styles.contentInfo}>
              <Text>Type: {clipboardContent.type}</Text>
              {clipboardContent.data && (
                <Text numberOfLines={3}>Data: {clipboardContent.data}</Text>
              )}
              {clipboardContent.mimeType && (
                <Text>MIME Type: {clipboardContent.mimeType}</Text>
              )}
              {clipboardContent.size && (
                <Text>Size: {clipboardContent.size} bytes</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  section: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentInfo: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
});

export default App;
