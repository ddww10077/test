//
// src/lib/utils.js
//
export function extractNodeName(url) {
    if (!url) return '';
    url = url.trim();
    try {
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1 && hashIndex < url.length - 1) {
            return decodeURIComponent(url.substring(hashIndex + 1)).trim();
        }
        const protocolIndex = url.indexOf('://');
        if (protocolIndex === -1) return '';
        const protocol = url.substring(0, protocolIndex);
        const mainPart = url.substring(protocolIndex + 3).split('#')[0];
        switch (protocol) {
            case 'vmess': {
                let padded = mainPart.padEnd(mainPart.length + (4 - mainPart.length % 4) % 4, '=');
                let ps = '';
                try {
                    const binaryString = atob(padded);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const jsonString = new TextDecoder('utf-8').decode(bytes);
                    const node = JSON.parse(jsonString);
                    ps = node.ps || '';
                } catch (e) {
                    console.error("Failed to decode vmess link:", e);
                }
                return ps;
            }
            case 'trojan':
            case 'vless': return mainPart.substring(mainPart.indexOf('@') + 1).split(':')[0] || '';
            case 'ss':
                const atIndexSS = mainPart.indexOf('@');
                if (atIndexSS !== -1) return mainPart.substring(atIndexSS + 1).split(':')[0] || '';
                try {
                    let base64Part = mainPart;
                    if (base64Part.includes('%')) {
                        base64Part = decodeURIComponent(base64Part);
                    }
                    const decodedSS = atob(base64Part);
                    const ssDecodedAtIndex = decodedSS.indexOf('@');
                    if (ssDecodedAtIndex !== -1) return decodedSS.substring(ssDecodedAtIndex + 1).split(':')[0] || '';
                } catch (e) {}
                return '';
            default:
                if(url.startsWith('http')) return new URL(url).hostname;
                return '';
        }
    } catch (e) { return url.substring(0, 50); }
}


/**
 * 为节点链接添加名称前缀（仅用于 UI 显示，不修改实际节点 name）
 * @param {string} link - 原始节点链接
 * @param {string} prefix - 要添加的前缀 (通常是订阅名)
 * @returns {string} - 添加前缀用于显示的名称，不影响实际节点 URL
 */
export function prependNodeName(link, prefix) {
    if (!prefix) return link; // 没有前缀，直接返回原链接

    const hashIndex = link.lastIndexOf('#');

    // 如果链接没有 #fragment
    if (hashIndex === -1) {
        // 保留原始 name，不修改 URL，只在 UI 中显示
        return `${link}#${encodeURIComponent(link)}`; 
    }

    const baseLink = link.substring(0, hashIndex);
    const originalName = decodeURIComponent(link.substring(hashIndex + 1));

    // 新增字段 _prefix 用于 UI 显示，不改变实际 node.name
    const newDisplayName = `${prefix} - ${originalName}`;
    // 返回原始 URL，同时在末尾添加显示前缀（可在前端 UI 用于展示）
    return `${baseLink}#${encodeURIComponent(originalName)}|${encodeURIComponent(newDisplayName)}`;
}

/**
 * [新增] 从节点链接中提取主机和端口
 * @param {string} url - 节点链接
 * @returns {{host: string, port: string}}
 */
export function extractHostAndPort(url) {
    if (!url) return { host: '', port: '' };

    try {
        const protocolEndIndex = url.indexOf('://');
        if (protocolEndIndex === -1) throw new Error('无效的 URL：缺少协议头');

        const protocol = url.substring(0, protocolEndIndex);
        
        const fragmentStartIndex = url.indexOf('#');
        const mainPartEndIndex = fragmentStartIndex === -1 ? url.length : fragmentStartIndex;
        let mainPart = url.substring(protocolEndIndex + 3, mainPartEndIndex);

        if (protocol === 'vmess') {
            const decodedString = atob(mainPart);
            const nodeConfig = JSON.parse(decodedString);
            return { host: nodeConfig.add || '', port: String(nodeConfig.port || '') };
        }
        
        let decoded = false;
        if ((protocol === 'ss' || protocol === 'ssr') && mainPart.indexOf('@') === -1) {
            try {
                let base64Part = mainPart;
                if (base64Part.includes('%')) {
                    base64Part = decodeURIComponent(base64Part);
                }
                mainPart = atob(base64Part);
                decoded = true;
            } catch (e) {}
        }

        if (protocol === 'ssr' && decoded) {
            const parts = mainPart.split(':');
            if (parts.length >= 2) {
                return { host: parts[0], port: parts[1] };
            }
        }
        
        const atIndex = mainPart.lastIndexOf('@');
        let serverPart = atIndex !== -1 ? mainPart.substring(atIndex + 1) : mainPart;

        const queryIndex = serverPart.indexOf('?');
        if (queryIndex !== -1) {
            serverPart = serverPart.substring(0, queryIndex);
        }
        const pathIndex = serverPart.indexOf('/');
        if (pathIndex !== -1) {
            serverPart = serverPart.substring(0, pathIndex);
        }

        const lastColonIndex = serverPart.lastIndexOf(':');
        
        if (serverPart.startsWith('[') && serverPart.includes(']')) {
            const bracketEndIndex = serverPart.lastIndexOf(']');
            const host = serverPart.substring(1, bracketEndIndex);
            if (lastColonIndex > bracketEndIndex) {
                 return { host, port: serverPart.substring(lastColonIndex + 1) };
            }
            return { host, port: '' };
        }

        if (lastColonIndex !== -1) {
            const potentialHost = serverPart.substring(0, lastColonIndex);
            const potentialPort = serverPart.substring(lastColonIndex + 1);
            if (potentialHost.includes(':')) { // 处理无端口的 IPv6
                return { host: serverPart, port: '' };
            }
            return { host: potentialHost, port: potentialPort };
        }
        
        if (serverPart) {
            return { host: serverPart, port: '' };
        }

        throw new Error('自定义解析失败');

    } catch (e) {
        console.error("提取主机和端口失败:", url, e);
        return { host: '解析失败', port: 'N/A' };
    }
}
