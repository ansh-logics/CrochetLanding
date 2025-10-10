"use client"
import { CldUploadWidget } from 'next-cloudinary';
import { CloudinaryUploadWidgetInfo } from 'next-cloudinary';
import {useState} from "react";



export default function admin(){
    const [resource, setResource] = useState<string | CloudinaryUploadWidgetInfo | undefined>();
    return(
        <CldUploadWidget 
        options={{sources:['local']}}
        signatureEndpoint="/api/cloudinary-params"
        onSuccess={(result,{widget})=>{
            setResource(result.info);
            console.log(result.info);
        
        }}
        >
        {({ open }) => {
            function handleOnClick(){
                setResource(undefined);
                open();
            }
            return (
            <button onClick={handleOnClick}>
                Upload an Image
            </button>
            );
        }}
        </CldUploadWidget>
    )
} 
