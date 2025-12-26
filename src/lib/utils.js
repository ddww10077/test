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
 * 节点名前缀函数已废弃，不再修改 URL，保证 Clash 国旗正常显示
 */
export function prependNodeName(link, prefix) {
    // 不修改链接，原样返回
    return link;
}

/**
 * 从节点链接中提取主机和端口
 */
export function extractHostAndPort(url) {
    if (!url) return { host: '', port: '' };

    try {
        const protocolEndIndex = url.indexOf('://');
        if (protocolEndIndex === -1) throw new Error('无效 URL');

        const protocol = url.substring(0, protocolEndIndex);
        const fragmentStartIndex = url.indexOf('#');
        const mainPartEndIndex = fragmentStartIndex === -1 ? url.length : fragmentStartIndex;
        let mainPart = url.substring(protocolEndIndex + 3, mainPartEndIndex);

        if (protocol === 'vmess') {
            const decoded = atob(mainPart);
            const nodeConfig = JSON.parse(decoded);
            return { host: nodeConfig.add || '', port: String(nodeConfig.port || '') };
        }

        let decoded = false;
        if ((protocol === 'ss' || protocol === 'ssr') && mainPart.indexOf('@') === -1) {
            try {
                let base64Part = mainPart;
                if (base64Part.includes('%')) base64Part = decodeURIComponent(base64Part);
                mainPart = atob(base64Part);
                decoded = true;
            } catch (e) {}
        }

        if (protocol === 'ssr' && decoded) {
            const parts = mainPart.split(':');
            if (parts.length >= 2) return { host: parts[0], port: parts[1] };
        }

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
