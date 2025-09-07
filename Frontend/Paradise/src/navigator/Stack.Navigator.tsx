import { createStackNavigator } from '@react-navigation/stack';
import Cadastro from '../page/cadastro/cadastro';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
      <Stack.Screen name="cadastro" component={Cadastro} />
      {/* outras telas */}
    </Stack.Navigator>
  );
}
