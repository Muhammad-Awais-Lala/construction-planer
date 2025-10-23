import { toast } from "react-toastify";


// React Toastifi message

window.toastify = (msg, type) => {
    switch (type) {
        case "success":
            return toast.success(msg);
        case "error":
            return toast.error(msg);
        case "warning":
            return toast.warning(msg);
        case "info":
            return toast.info(msg);

        default:
            return toast(msg)
    }
}
