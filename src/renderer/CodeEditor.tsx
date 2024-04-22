import '@codingame/monaco-vscode-python-default-extension';
import { UserConfig } from 'monaco-editor-wrapper';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { URI } from 'vscode-uri';
import { editor as mEditor, IRange } from 'monaco-editor';

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
        // jedi_definition: { enabled: false }, // "go to definition" context action
        pycodestyle: { ignore: ['W605', 'E501', 'E402', 'E722'] },
      },
    },
  },
};

/* istanbul ignore next: we mock the whole  editor so there isnt much to test */
function getUserConfig(code: string, fileUri: string) {
  const userConfig: UserConfig = {
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
              pluginConfig,
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
          uri: URI.file(fileUri),
        },
      },
    },
    wrapperConfig: {
      serviceConfig: {
        debugLogging: true,
      },
      editorAppConfig: {
        $type: 'extended',
        languageId: 'python',
        userConfiguration: {
          json: JSON.stringify({
            'workbench.colorTheme': 'Visual Studio Light',
          }),
        },
        useDiffEditor: false,
        code,
      },
    },
  };

  return userConfig;
}

export default function CodeEditor() {
  /**
   * Code is intentionally incorrect - language server will pick this up on connection and highlight the error
   */
  const code = `def main():
        return pass`;

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <MonacoEditorReactComp
        userConfig={getUserConfig(code, '/test')}
        style={{
          height: '100%',
        }}
        onLoad={() => {
          console.log('Loaded');
          mEditor.registerLinkOpener({
            open(resource): boolean | Promise<boolean> {
              console.log('registerLinkOpener', resource);

              return true;
            },
          });
          mEditor.registerEditorOpener({
            openCodeEditor(
              source,
              resource,
              selectionOrPosition?,
            ): boolean | Promise<boolean> {
              console.log('registerEditorOpener', resource);
              window.alert('registerEditorOpener called!');

              return true;
            },
          });
        }}
        onError={(e) => {
          console.error(e);
        }}
      />
    </div>
  );
}
