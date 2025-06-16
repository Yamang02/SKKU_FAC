import SystemManagementController from './system/SystemManagementController.js';
import UserAdminController from '../../user/admin/controller/UserAdminController.js';
import ExhibitionAdminController from '#domain/exhibition/admin/controller/ExhibitionAdminController.js';
import ArtworkAdminController from '#domain/artwork/admin/controller/ArtworkAdminController.js';
import { createAdminRouter } from './AdminRouter.js';

export {
    SystemManagementController,
    UserAdminController,
    ExhibitionAdminController,
    ArtworkAdminController,
    createAdminRouter
};
