import React from "react";
import { useToast } from 'react-native-toast-notifications';
// import fonts from '../../utils/fonts';
// import { moderateScale } from '../../utils/responsiveSize';
import { View } from 'react-native';
import { moderateScale } from "react-native-size-matters";

export const useCommonToast = () => {
  const toast = useToast();

  const showToast = (message:any, type = 'normal', duration = 4000, placement : "top" | "bottom" | "center" = 'top') => {
    toast.show(message, {
      type,
      duration,
      placement:placement,
    });
  };

  const showErrorToast = (message:string) => {
    
    toast.show(message, {
      type:'warning',
      duration:4000,
      placement:'bottom',
      style:{
        backgroundColor:'white',
        borderColor:'red',
        borderRadius:100,
        borderWidth:1
      },
      textStyle:{
        // fontFamily:fonts.nunitoBold,
        fontSize:moderateScale(16),
        color:'red'
      },
      warningColor:'red',
      icon:<View/>
    });
  };

  const showSuccessToast = (message:string) => {
    
    toast.show(message, {
      type:'success',
      duration:4000,
      placement:'bottom',
      style:{
        backgroundColor:'white',
        borderColor:'green',
        borderRadius:100,
        borderWidth:1
      },
      textStyle:{
        // fontFamily:fonts.nunitoRegular,
        fontSize:moderateScale(16),
        color:'green'
      },
      // warningColor:'red',
      icon:<View/>
    });
  };
  const showCopyToClipboardToast = () => {
    
    toast.show('Copied to clipboard', {
      type:'success',
      duration:4000,
      placement:'bottom',
      style:{
        backgroundColor: 'rgba(60, 60, 60, 0.85)',
        // borderColor:'green',
        borderRadius:100,
        // borderWidth:1
      },
      textStyle:{
        // fontFamily:fonts.nunitoRegular,
        fontSize:moderateScale(16),
        color:'white'
      },
      // warningColor:'red',
      icon:<View/>
    });
  };


  return { showToast, showErrorToast,showSuccessToast, showCopyToClipboardToast };
};

    
    

