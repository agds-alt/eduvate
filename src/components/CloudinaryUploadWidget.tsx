"use client";

import { useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Upload } from "lucide-react";

declare global {
  interface Window {
    cloudinary: any;
  }
}

type CloudinaryUploadWidgetProps = {
  onUploadSuccess: (url: string) => void;
  buttonText?: string;
  disabled?: boolean;
};

export default function CloudinaryUploadWidget({
  onUploadSuccess,
  buttonText = "Upload Gambar",
  disabled = false,
}: CloudinaryUploadWidgetProps) {
  const cloudinaryRef = useRef<any>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Load Cloudinary script
    if (!document.getElementById("cloudinary-upload-widget")) {
      const script = document.createElement("script");
      script.id = "cloudinary-upload-widget";
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        cloudinaryRef.current = window.cloudinary;
      };
    } else {
      cloudinaryRef.current = window.cloudinary;
    }

    return () => {
      // Cleanup if needed
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, []);

  const openWidget = () => {
    if (!cloudinaryRef.current) {
      console.error("Cloudinary script not loaded");
      return;
    }

    // Get credentials from environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert(
        "Cloudinary belum dikonfigurasi. Silakan tambahkan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ke .env"
      );
      return;
    }

    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFileSize: 5000000, // 5MB
        clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
        cropping: true,
        croppingAspectRatio: 16 / 9,
        croppingShowDimensions: true,
        showSkipCropButton: true,
        folder: "eduvate/gallery", // Organize uploads
        resourceType: "image",
        language: "id", // Indonesian language
        text: {
          id: {
            or: "Atau",
            back: "Kembali",
            close: "Tutup",
            no_results: "Tidak ada hasil",
            search_placeholder: "Cari file...",
            menu: {
              files: "File Saya",
              web: "Web Address",
              camera: "Kamera",
            },
            local: {
              browse: "Pilih File",
              dd_title_single: "Seret dan lepas file di sini",
              dd_title_multi: "Seret dan lepas file di sini",
              drop_title_single: "Lepas file untuk upload",
              drop_title_multiple: "Lepas file untuk upload",
            },
            crop: {
              title: "Potong Gambar",
              crop_btn: "Potong & Upload",
              skip_btn: "Skip & Upload",
              reset_btn: "Reset",
            },
          },
        },
      },
      (error: any, result: any) => {
        if (error) {
          console.error("Upload error:", error);
          alert("Gagal upload gambar. Silakan coba lagi.");
          return;
        }

        if (result.event === "success") {
          // Get the secure URL from Cloudinary
          const imageUrl = result.info.secure_url;
          console.log("Upload successful:", imageUrl);
          onUploadSuccess(imageUrl);
          widgetRef.current.close();
        }
      }
    );

    widgetRef.current.open();
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={openWidget}
      disabled={disabled}
      className="w-full"
    >
      <Upload className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
}
