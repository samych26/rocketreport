#!/usr/bin/env python3
"""Python sandbox runner for RocketReport code transformation."""
import sys
import json
import time
import traceback
import builtins

input_data = sys.stdin.read()

try:
    payload = json.loads(input_data)
    code = payload.get('code', '')
    data = payload.get('data', {})
except Exception as e:
    print(json.dumps({'success': False, 'error': f'Invalid input: {e}', 'logs': []}))
    sys.exit(1)

logs = []
start = time.time()

# Capture print output
_original_print = builtins.print
def _captured_print(*args, **kwargs):
    logs.append(' '.join(str(a) for a in args))
builtins.print = _captured_print

namespace = {
    'data': data,
    'apiData': data,
    'json': json,
    'result': None,
}

try:
    exec(code, namespace)

    # User should set `result` or define `process_data(data)`
    if callable(namespace.get('process_data')):
        output = namespace['process_data'](data)
    else:
        output = namespace.get('result', data)

    execution_time = round((time.time() - start) * 1000, 2)

    _original_print(json.dumps({
        'success': True,
        'result': output,
        'logs': logs,
        'execution_time_ms': execution_time,
    }))

except Exception as e:
    _original_print(json.dumps({
        'success': False,
        'error': str(e),
        'traceback': traceback.format_exc(),
        'logs': logs,
    }))
    sys.exit(1)
