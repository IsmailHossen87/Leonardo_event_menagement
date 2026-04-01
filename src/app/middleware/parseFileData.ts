import { Request, Response, NextFunction } from 'express';
import { getMultipleFilePath, getSingleFilePath, IFolderName } from './getFilePath';

const parseFileData = (singleFieldName?: IFolderName, multipleFieldName?: IFolderName) => {
     return async (req: Request, res: Response, next: NextFunction) => {
          try {
               // console.log('========== PARSE FILE DATA MIDDLEWARE ==========');
               // console.log('singleFieldName:', singleFieldName);
               // console.log('multipleFieldName:', multipleFieldName);

               // // Log the raw files and body
               // console.log('req.files type:', typeof req.files);
               // console.log('req.files is array?', Array.isArray(req.files));
               // console.log('req.files keys:', req.files ? Object.keys(req.files) : 'No files');
               // console.log('req.body:', req.body);

               const parsedData: any = {};

               // Handle single file (like image)
               if (singleFieldName) {
                    // console.log(`Processing single field: ${singleFieldName}`);
                    const filePath = getSingleFilePath(req.files, singleFieldName);
                    // console.log(`getSingleFilePath returned:`, filePath);

                    if (filePath) {
                         parsedData[singleFieldName] = filePath;
                         console.log(`Added to parsedData[${singleFieldName}]:`, filePath);
                    } else {
                         console.log(`No file found for ${singleFieldName}`);
                    }
               }

               // Handle multiple files (like gallary)
               if (multipleFieldName) {
                    // console.log(`Processing multiple field: ${multipleFieldName}`);
                    const filePaths = getMultipleFilePath(req.files, multipleFieldName);
                    // console.log(`getMultipleFilePath returned:`, filePaths);

                    if (filePaths && filePaths.length > 0) {
                         parsedData[multipleFieldName] = filePaths;
                         // console.log(`Added to parsedData[${multipleFieldName}]:`, filePaths);
                    } else {
                         console.log(`No files found for ${multipleFieldName}`);
                    }
               }

               // Parse additional data from form-data
               if (req.body && req.body.data) {
                    try {
                         // console.log('Parsing req.body.data:', req.body.data);
                         const data = JSON.parse(req.body.data);
                         // console.log('Parsed JSON data:', data);

                         // Merge parsed file paths with the JSON data
                         req.body = { ...data, ...parsedData };
                         // console.log('Final merged body:', req.body);
                    } catch (parseError) {
                         // console.error('Error parsing req.body.data:', parseError);
                         req.body = { ...parsedData };
                    }
               } else {
                    // If no data field, just use the parsed file paths
                    // console.log('No req.body.data found, using parsedData only');
                    req.body = parsedData;
               }

               // console.log('========== END PARSE FILE DATA ==========');
               next();
          } catch (error) {
               console.error('Error in parseFileData middleware:', error);
               next(error);
          }
     };
};

export default parseFileData;