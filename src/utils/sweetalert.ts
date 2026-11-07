/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Swal from 'sweetalert2';

export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: '#166534', // school green
    confirmButtonText: 'ตกลง',
    customClass: {
      popup: 'font-["Sarabun"] rounded-xl border-2 border-slate-900',
    },
  });
};

export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon,
    title,
  });
};

export const showConfirm = async (title: string, text: string, confirmText = 'ยืนยัน', cancelText = 'ยกเลิก') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#475569',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: 'font-["Sarabun"] rounded-xl border-2 border-slate-900',
    },
  });
  return result.isConfirmed;
};
