import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

// Constants
const MAX_COLLABORATION_IMAGES = 4;
const MAX_PROFILE_IMAGES = 1;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const useImageUpload = () => {
  const [imageUploading, setImageUploading] = useState(false);

  // Validate File Size
  const validateFileSize = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    if (blob.size > MAX_FILE_SIZE_BYTES) {
      Alert.alert(
        "File Too Large",
        `Image must be smaller than ${MAX_FILE_SIZE_MB}MB. Please choose a smaller image.`,
      );
      return { valid: false, blob: null };
    }
    return { valid: true, blob };
  };

  // Upload to Firebase
  const uploadToFirebase = async (blob, folder) => {
    const filename = `${folder}/${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  // Pick Collaboration Images
  const pickCollaborationImages = async (currentImages = [], onSuccess) => {
    // Check current image count
    if (currentImages.length >= MAX_COLLABORATION_IMAGES) {
      Alert.alert(
        "Limit Reached",
        `You can only upload up to ${MAX_COLLABORATION_IMAGES} images per collaboration.`,
      );
      return;
    }

    const remaining = MAX_COLLABORATION_IMAGES - currentImages.length;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to upload images",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUploading(true);
      try {
        const { valid, blob } = await validateFileSize(result.assets[0].uri);
        if (!valid) return;

        const downloadUrl = await uploadToFirebase(blob, "collaborations");

        const updatedImages = [...currentImages, downloadUrl];
        onSuccess(updatedImages);

        Alert.alert(
          "Success",
          `Image uploaded. ${MAX_COLLABORATION_IMAGES - updatedImages.length} slot(s) remaining.`,
        );
      } catch (error) {
        Alert.alert("Error", "Failed to upload image. Please try again.");
        console.error("Upload error:", error);
      } finally {
        setImageUploading(false);
      }
    }
  };

  // Pick Profile Image
  const pickProfileImage = async (onSuccess) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to upload images",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUploading(true);
      try {
        const { valid, blob } = await validateFileSize(result.assets[0].uri);
        if (!valid) return;

        const downloadUrl = await uploadToFirebase(blob, "profiles");

        // Only one profile image — pass url directly
        onSuccess(downloadUrl);

        Alert.alert("Success", "Profile image uploaded successfully");
      } catch (error) {
        Alert.alert("Error", "Failed to upload image. Please try again.");
        console.error("Upload error:", error);
      } finally {
        setImageUploading(false);
      }
    }
  };

  return {
    imageUploading,
    pickCollaborationImages,
    pickProfileImage,
  };
};

export default useImageUpload;
