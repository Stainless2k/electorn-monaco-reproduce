import '@codingame/monaco-vscode-python-default-extension';
import { UserConfig } from 'monaco-editor-wrapper';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import { MonacoLanguageClient } from 'monaco-languageclient';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import { URI } from 'vscode-uri';

export const configureMonacoWorkers = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useWorkerFactory({
    basePath: '../../../node_modules',
  });
};

const pluginConfig = {
  settings: {
    pylsp: {
      plugins: {
        pycodestyle: { ignore: ['W605', 'E501', 'E402', 'E722'] },
      },
    },
  },
};

export const createUserConfig = (code: string): UserConfig => {
  return {
    languageClientConfig: {
      options: {
        name: 'Python Language Server',
        $type: 'WebSocket',
        host: 'localhost',
        port: 9002,
        path: 'python',
        secured: false,
        startOptions: {
          onCall: (languageClient?: MonacoLanguageClient) => {
            languageClient?.sendRequest(
              'workspace/didChangeConfiguration',
              pluginConfig
            );
          },
          reportStatus: true,
        },
      },
      clientOptions: {
        documentSelector: ['python'],
        workspaceFolder: {
          index: 0,
          name: 'workspace',
          uri: URI.file(''),
        },
      },
    },
    wrapperConfig: {
      serviceConfig: {
        userServices: {
          ...getTextmateServiceOverride(),
          ...getThemeServiceOverride(),
        },
        debugLogging: true,
      },
      editorAppConfig: {
        $type: 'extended',
        languageId: 'python',
        codeUri: '/workspace/python.py',
        extensions: [
          {
            config: {
              name: 'python-client',
              publisher: 'monaco-languageclient-project',
              version: '1.0.0',
              engines: {
                vscode: '^1.85.0',
              },
              contributes: {
                languages: [
                  {
                    id: 'python',
                    extensions: ['.py', 'pyi'],
                    aliases: ['python'],
                    mimetypes: ['application/python'],
                  },
                ],
              },
            },
          },
        ],
        userConfiguration: {
          json: JSON.stringify({
            'workbench.colorTheme': 'Default Light Modern',
          }),
        },
        useDiffEditor: false,
        code,
      },
    },
  };
};
export default function CodeEditor() {
  /**
   * Code is intentionally incorrect - language server will pick this up on connection and highlight the error
   */
  const code = `def main():
        return pass`;

  const onTextChanged = (text: string, isDirty: boolean) => {
    console.log(`Dirty? ${isDirty} Content: ${text}`);
  };

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <MonacoEditorReactComp
        userConfig={createUserConfig(code)}
        style={{
          height: '100%',
        }}
        onTextChanged={onTextChanged}
        onLoad={() => {
          console.log('Loaded');
        }}
        onError={(e) => {
          console.error(e);
        }}
      />
    </div>
  );
}
