import toastr from 'toastr';
import 'toastr/build/toastr.min.css'
export default function useToastr() {
    toastr.options.positionClass = 'toast-bottom-right';
    toastr.options.closeButton = true;
    toastr.options.progressBar = true;
    return toastr;
}