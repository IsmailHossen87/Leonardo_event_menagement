import { Request, Response, NextFunction } from 'express';
import { getMultipleFilePath, IFolderName } from './getFilePath';


const parseMultipleFileData = (fieldName: IFolderName) => {
     return async (req: Request, res: Response, next: NextFunction) => {
          try {
               // Use dynamic fieldName to get the file path
               const filePath = getMultipleFilePath(req.files, fieldName);
               // Handle additional data if present
               if (req.body.data) {
                    const data = JSON.parse(req.body.data);
                    req.body = { ...data, [fieldName]: filePath };
               } else {
                    req.body = { ...req.body, [fieldName]: filePath };
               }

               next();
          } catch (error) {
               next(error);
          }
     };
};

export default parseMultipleFileData;
