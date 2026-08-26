package com.bit.maintenance.service;

import com.bit.maintenance.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

// Local disk storage, matching the project doc's call that "local file
// storage is perfectly reasonable... unless your faculty specifically
// requires deployment." Swap this out for cloud storage later without
// touching any calling code if that changes.
@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    /** Returns null if no file was provided; otherwise the public URL path to fetch it. */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String extension = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String filename = UUID.randomUUID() + extension;

            Path targetPath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetPath);

            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new ApiException("Failed to store uploaded file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
