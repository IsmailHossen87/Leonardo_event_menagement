import { IFOLDER_NAMES } from "../../enums/files";

// Type for folder names
export type IFolderName = `${IFOLDER_NAMES}`;

// ✅ Helper function: Convert absolute path to relative URL path
const convertToRelativePath = (absolutePath: string): string => {
    console.log('convertToRelativePath - Input:', absolutePath);

    // Find 'uploads' in the path
    const uploadsIndex = absolutePath.indexOf('uploads');

    if (uploadsIndex !== -1) {
        // Get everything from 'uploads' onwards
        const relativePath = absolutePath.substring(uploadsIndex);
        // Replace backslashes with forward slashes (for Windows)
        const normalizedPath = relativePath.replace(/\\/g, '/');
        // Add leading slash
        const finalPath = '/' + normalizedPath;
        console.log('convertToRelativePath - Output:', finalPath);
        return finalPath;
    }

    console.log('convertToRelativePath - No uploads folder found, returning as is');
    return absolutePath;
};

// ✅ Get single file path
export const getSingleFilePath = (files: any, fieldName: IFolderName | string): string | undefined => {
    console.log('getSingleFilePath - files:', files);
    console.log('getSingleFilePath - fieldName:', fieldName);

    if (files && files[fieldName] && files[fieldName][0] && files[fieldName][0].path) {
        const absolutePath = files[fieldName][0].path;
        console.log('getSingleFilePath - absolutePath:', absolutePath);
        return convertToRelativePath(absolutePath);
    }

    console.log('getSingleFilePath - No file found for field:', fieldName);
    return undefined;
};

// ✅ Get multiple file paths (for gallary, images, etc.)
export const getMultipleFilePath = (files: any, fieldName: IFolderName | string): string[] => {
    console.log('getMultipleFilePath - files:', files);
    console.log('getMultipleFilePath - fieldName:', fieldName);

    const filePaths: string[] = [];

    if (files && files[fieldName] && Array.isArray(files[fieldName])) {
        console.log('getMultipleFilePath - files array length:', files[fieldName].length);

        files[fieldName].forEach((file: any, index: number) => {
            if (file && file.path) {
                console.log(`getMultipleFilePath - file ${index} path:`, file.path);
                filePaths.push(convertToRelativePath(file.path));
            }
        });
    }

    console.log('getMultipleFilePath - result:', filePaths);
    return filePaths;
};