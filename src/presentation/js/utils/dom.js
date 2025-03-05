export const domUtils = {
    createElement(tag, className, attributes = {}) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        return element;
    },
    
    appendChildren(parent, ...children) {
        children.forEach(child => {
            if (child) parent.appendChild(child);
        });
        return parent;
    },
    
    setInnerHTML(element, html) {
        element.innerHTML = html;
        return element;
    },
    
    addEventListeners(element, events) {
        Object.entries(events).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
        return element;
    },
    
    toggleClass(element, className, condition) {
        element.classList.toggle(className, condition);
        return element;
    }
}; 