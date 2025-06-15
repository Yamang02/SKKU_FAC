import SystemManagementController from './system/SystemManagementController.js';
import UserAdminController from '../../user/admin/controller/UserAdminController.js';
import ExhibitionManagementController from './exhibition/ExhibitionManagementController.js';
import ArtworkAdminController from '#domain/artwork/admin/controller/ArtworkAdminController.js';
import { createAdminRouter } from './AdminRouter.js';

export {
    SystemManagementController,
    UserAdminController,
    ExhibitionManagementController,
    ArtworkAdminController,
    createAdminRouter
};
