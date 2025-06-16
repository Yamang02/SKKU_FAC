export interface NavigationRoute {
    name: string;
    path: string;
    component: React.ComponentType<any>;
    exact?: boolean;
    private?: boolean;
    adminOnly?: boolean;
}

export interface NavigationState {
    currentRoute: string;
    previousRoute: string | null;
    params: Record<string, any>;
    query: Record<string, string>;
}

export interface TabNavigationItem {
    key: string;
    title: string;
    icon?: string;
    badge?: number;
    disabled?: boolean;
}

export interface DrawerNavigationItem {
    key: string;
    title: string;
    icon?: string;
    route?: string;
    children?: DrawerNavigationItem[];
    adminOnly?: boolean;
}

export interface BreadcrumbItem {
    title: string;
    path?: string;
    active?: boolean;
}

export interface NavigationContext {
    navigate: (path: string, params?: any) => void;
    goBack: () => void;
    replace: (path: string, params?: any) => void;
    canGoBack: boolean;
    currentRoute: NavigationRoute | null;
}
