import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import './Classifier.css';
import {Alert, Button, Image, Spinner} from 'react-bootstrap';
import axios from 'axios';
import Webcam from 'react-webcam';

class Classifier extends Component {
    state = { 
        files: [],
        isLoading: false,
        recentImage: null,
     }

     onDrop =(files)=>{
        this.setState({
            files:[],
            isLoading: true, 
            recentImage: null,
            })
        this.loadImage(files)
     }

     loadImage=(files)=>{
        setTimeout(() => {
            this.setState({
                files,
                isLoading: false
            }, () => {
                console.log(this.state.files[0].name)
                console.log(this.state.files[0])
            })
        }, 1000);
     }

     activateSpinner =()=> {
        this.setState({
            files:[],
            isLoading:true,
        })
     }

     deactivateSpinner =()=> {
        this.setState({isLoading:false})
     }

     sendImage =()=>{
         this.activateSpinner()
         let formData = new FormData()
         formData.append('picture', this.state.files[0], this.state.files[0].name)
         axios.post('http://127.0.0.1:8000/api/images/', formData, {
             headers: {
                'accept': 'application/json',
                'content-type': 'multipart/form-data'
             }
         })
         .then(resp=>{
             this.getImageClass(resp)
             console.log(resp.data.id)
         })
         .catch(err=>{
             console.log(err)
         })
     }

     getImageClass =(obj)=> {
        axios.get(`http://127.0.0.1:8000/api/images/${obj.data.id}/`, {
            headers: {
                'accept': 'application/json',
            }
        })
        .then(resp=>{
            this.setState({recentImage:resp})
            console.log(resp)
        })
        .catch(err=>{
            console.log(err)
        })
        this.deactivateSpinner()
     }

    setRef = (webcam) => {
        this.webcam = webcam;
    }

    dataURLtoBlob = (dataurl) => {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    screenShot = () => {
        const imageSrc = this.webcam.getScreenshot();
        // const blob = fetch(imageSrc).then((res) => res.blob());
        const blob = this.dataURLtoBlob(imageSrc);
        // console.log(imageSrc)
        console.log(blob)
        this.setState({files:[]})
        this.state.files.push(blob);
        console.log(typeof blob)
        this.sendImage();
    }

    render() { 
        const files = this.state.files.map(file => (
            <li key={file.name}>
              {file.name} - {file.size} bytes
            </li>
          ));
        return ( 
            <div>
            <Dropzone onDrop={this.onDrop} accept='image/png, image/jpeg'> 
            {({isDragActive, getRootProps, getInputProps}) => (
                <section className="container">
                    <div {...getRootProps({className: 'dropzone back'})}>
                        <input {...getInputProps()} />
                        <i className="far fa-image mb-2 text-muted" style={{fontSize:100}}></i>
                        <p className='text-muted'>{isDragActive ? "Drop some images" : "Drag 'n' drop some files here, or click to select files"}</p>
                    </div>
                    <aside>
                        {files}
                    </aside>

                    {this.state.files.length > 0 &&
                    <Button variant='info' size='lg' className='mt-3' onClick={this.sendImage}>Select Image</Button>
                    }

                    {this.state.isLoading && 
                    <Spinner animation="border" role="status"></Spinner>
                    }

                    {this.state.recentImage &&
                    <React.Fragment>
                        <Alert variant='primary'>
                            {this.state.recentImage.data.classified}
                        </Alert>
                        <Image className='justify-content-center' src={this.state.recentImage.data.picture} height='200' rounded/>
                    </React.Fragment>
                    }
                </section>
            )}
            </Dropzone>
            <Webcam
                audio = {false}
                ref = {this.setRef}
                screenshotFormat="image/jpeg"
            />
            <Button variant='info' size='lg' className='mt-3' onClick={this.screenShot}>Take a picture</Button>
            </div>
         );
    }
}
 
export default Classifier;