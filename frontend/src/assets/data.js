// import Icon from '../assets/Unomate.png'

import { LuNotebookPen } from "react-icons/lu";
import { MdTitle } from "react-icons/md";
import { RiImage2Line } from "react-icons/ri";
import { FaEraser } from "react-icons/fa6";
import { CiSquareRemove } from "react-icons/ci";
import { VscPreview } from "react-icons/vsc";

export const AiToolsData = [
    {
        title: 'Image Generation',
        description: 'Generate Images using AI',
        Icon: RiImage2Line,
        bg: {
            from: '#3588F2',
            to: '#0BB0D7'
        },
        path: '/ai/generate-image'
    },
    {
        title: 'Generate Articles',
        description: 'Generate articles on any topic using AI',
        Icon: LuNotebookPen,
        bg: {
            from: '#3588F2',
            to: '#0BB0D7'
        },
        path: '/ai/generate-article'
    },
    {
        title: 'Generate Blog Title',
        description: 'Generate blog title on any topic using AI',
        Icon: MdTitle,
        bg: {
            from: '#3588F2',
            to: '#0BB0D7'
        },
        path: '/ai/blog-title'
    },
    {
        title: 'Background Removal',
        description: 'Remove background from images using AI',
        Icon: FaEraser,
        bg: {
            from: '#3588F2',
            to: '#0BB0D7'
        },
        path: '/ai/remove-bg'
    },
    {
        title: 'Resume Review',
        description: 'Get your resume reviewed by AI',
        Icon: VscPreview,
        bg: {
            from: '#3588F2',
            to: '#0BB0D7'
        },
        path: '/ai/review-resume'
    },
    {
        title: 'Object Removal',
        description: 'Remove unwanted object from image using AI',
        Icon: CiSquareRemove,
        bg: {
            from: '#3588F2',
            to: '#0BB0D7'
        },
        path: '/ai/remove-object'
    },
]