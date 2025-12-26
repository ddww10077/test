//
// src/lib/utils.js
//

/**
 * 从节点链接提取节点名称
 * @param {string} url - 节点链接
 * @returns {string} 节点名称
 */
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
                try {
                    const padded = mainPart.padEnd(mainPart.length + (4 - mainPart.length % 4) % 4, '=');
                    const binaryString = atob(padded);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const jsonString = new TextDecoder('utf-8').decode(bytes);
                    const node = JSON.parse(jsonString);
                    return node.ps || '';
                } catch (e) {
                    console.error("Failed to decode vmess link:", e);
                    return '';
                }
            }
            case 'trojan':
            case 'vless':
                return mainPart.substring(mainPart.indexOf('@') + 1).split(':')[0] || '';
            case 'ss':
                const atIndexSS = mainPart.indexOf('@');
                if (atIndexSS !== -1) return mainPart.substring(atIndexSS + 1).split(':')[0] || '';
                try {
                    let base64Part = mainPart;
                    if (base64Part.includes('%')) base64Part = decodeURIComponent(base64Part);
                    const decodedSS = atob(base64Part);
                    const ssDecodedAtIndex = decodedSS.indexOf('@');
                    if (ssDecodedAtIndex !== -1) return decodedSS.substring(ssDecodedAtIndex + 1).split(':')[0] || '';
                } catch (e) {}
                return '';
            default:
                if (url.startsWith('http')) return new URL(url).hostname;
                return '';
        }
    } catch (e) {
        return url.substring(0, 50);
    }
}

/**
 * 为节点链接添加名称前缀（仅生成显示名，不修改原始链接）
 * @param {string} nodeName - 节点原始名称
 * @param {string} prefix - 订阅名或前缀
 * @returns {string} 显示用名称
 */
export function getDisplayName(nodeName, prefix) {
    if (!prefix) return nodeName;
    // 即使开关关闭，也保持显示国旗，前缀只用于前端显示
    return `${prefix} - ${nodeName}`;
}

/**
 * 从节点链接中提取主机和端口
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

        // VMess 专用处理
        if (protocol === 'vmess') {
            const decodedString = atob(mainPart);
            const nodeConfig = JSON.parse(decodedString);
            return { host: nodeConfig.add || '', port: String(nodeConfig.port || '') };
        }

        let decoded = false;
        // SS/SSR Base64 解码处理
        if ((protocol === 'ss' || protocol === 'ssr') && mainPart.indexOf('@') === -1) {
            try {
                let base64Part = mainPart;
                if (base64Part.includes('%')) base64Part = decodeURIComponent(base64Part);
                mainPart = atob(base64Part);
                decoded = true;
            } catch (e) {}
        }

        // SSR 解码后处理
        if (protocol === 'ssr' && decoded) {
            const parts = mainPart.split(':');
            if (parts.length >= 2) return { host: parts[0], port: parts[1] };
        }

        // 通用解析
        const atIndex = mainPart.lastIndexOf('@');
        let serverPart = atIndex !== -1 ? mainPart.substring(atIndex + 1) : mainPart;

        const queryIndex = serverPart.indexOf('?');
        if (queryIndex !== -1) serverPart = serverPart.substring(0, queryIndex);
        const pathIndex = serverPart.indexOf('/');
        if (pathIndex !== -1) serverPart = serverPart.substring(0, pathIndex);

        const lastColonIndex = serverPart.lastIndexOf(':');

        if (serverPart.startsWith('[') && serverPart.includes(']')) {
            const bracketEndIndex = serverPart.lastIndexOf(']');
            const host = serverPart.substring(1, bracketEndIndex);
            if (lastColonIndex > bracketEndIndex) return { host, port: serverPart.substring(lastColonIndex + 1) };
            return { host, port: '' };
        }

        if (lastColonIndex !== -1) {
            const potentialHost = serverPart.substring(0, lastColonIndex);
            const potentialPort = serverPart.substring(lastColonIndex + 1);
            if (potentialHost.includes(':')) return { host: serverPart, port: '' };
            return { host: potentialHost, port: potentialPort };
        }

        if (serverPart) return { host: serverPart, port: '' };

        throw new Error('解析失败');
    } catch (e) {
        console.error("提取主机和端口失败:", url, e);
        return { host: '解析失败', port: 'N/A' };
    }
}
