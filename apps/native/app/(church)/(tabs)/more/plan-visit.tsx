import { useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenHeader } from '../../../../src/components/StackScreenHeader';
import { usePublicSite } from '../../../../src/hooks/usePublicSite';
import { DAY_LABELS, formatServiceTime, todayIsoDate } from '../../../../src/lib/format';
import { trpc } from '../../../../src/lib/trpc';
import { useAuth } from '../../../../src/providers/AuthProvider';
import { useTenant } from '../../../../src/providers/TenantProvider';

export default function PlanVisitScreen() {
  const { slug, theme } = useTenant();
  const { user } = useAuth();
  const site = usePublicSite();
  const locations = site.data?.locations ?? [];

  const [firstName, setFirstName] = useState(() => user?.name?.split(/\s+/)[0] ?? '');
  const [lastName, setLastName] = useState(() => user?.name?.split(/\s+/).slice(1).join(' ') ?? '');
  const [email, setEmail] = useState(() => user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [visitDate, setVisitDate] = useState(todayIsoDate());
  const [locationId, setLocationId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  const selectedLocation = useMemo(() => {
    if (locations.length === 1) return locations[0]!;
    return locations.find((l) => l.id === locationId) ?? null;
  }, [locations, locationId]);

  const services = selectedLocation?.services ?? [];

  const submit = trpc.visitPlans.submit.useMutation({
    onSuccess: () => setDone(true),
    onError: (e) => Alert.alert('Could not submit', e.message),
  });

  const onSubmit = () => {
    if (!slug) return;
    submit.mutate({
      slug,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      visitDate,
      locationId: locations.length > 1 ? locationId : locations[0]?.id ?? null,
      serviceId: services.length > 0 ? serviceId : null,
      notes: notes.trim() || null,
    });
  };

  const inputClass =
    'mt-1 rounded-xl border border-border bg-card px-3.5 py-3 text-base text-foreground';

  return (
    <View className="flex-1 bg-background">
      <StackScreenHeader title="Plan a visit" />
      {site.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : locations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-muted-foreground">
            Visits aren’t available until a campus is set up.
          </Text>
        </View>
      ) : done ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="checkmark-circle" size={48} color={theme.primary} />
          <Text className="mt-4 text-center text-xl font-bold text-foreground">You’re all set</Text>
          <Text className="mt-2 text-center text-base text-muted-foreground">
            Thanks for planning a visit. Someone from the church will follow up if needed.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-4 p-5 pb-12" keyboardShouldPersistTaps="handled">
          <Field label="First name">
            <TextInput
              className={inputClass}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              placeholderTextColor={theme.muted}
            />
          </Field>
          <Field label="Last name">
            <TextInput
              className={inputClass}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              placeholderTextColor={theme.muted}
            />
          </Field>
          <Field label="Email">
            <TextInput
              className={inputClass}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.muted}
            />
          </Field>
          <Field label="Phone (optional)">
            <TextInput
              className={inputClass}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={theme.muted}
            />
          </Field>
          <Field label="Visit date (YYYY-MM-DD)">
            <TextInput
              className={inputClass}
              value={visitDate}
              onChangeText={setVisitDate}
              autoCapitalize="none"
              placeholder={todayIsoDate()}
              placeholderTextColor={theme.muted}
            />
          </Field>

          {locations.length > 1 ? (
            <Field label="Campus">
              <View className="mt-1 gap-2">
                {locations.map((loc) => (
                  <Pressable
                    key={loc.id}
                    onPress={() => {
                      setLocationId(loc.id);
                      setServiceId(null);
                    }}
                    className="rounded-xl border px-3.5 py-3"
                    style={{
                      borderColor: locationId === loc.id ? theme.primary : theme.border,
                      backgroundColor: theme.card,
                    }}
                  >
                    <Text className="font-medium text-foreground">{loc.name}</Text>
                  </Pressable>
                ))}
              </View>
            </Field>
          ) : null}

          {services.length > 0 ? (
            <Field label="Service">
              <View className="mt-1 gap-2">
                {services.map((service) => (
                  <Pressable
                    key={service.id}
                    onPress={() => setServiceId(service.id)}
                    className="rounded-xl border px-3.5 py-3"
                    style={{
                      borderColor: serviceId === service.id ? theme.primary : theme.border,
                      backgroundColor: theme.card,
                    }}
                  >
                    <Text className="font-medium text-foreground">
                      {DAY_LABELS[service.dayOfWeek]} · {service.name} ·{' '}
                      {formatServiceTime(service.startTime)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Field>
          ) : null}

          <Field label="Notes (optional)">
            <TextInput
              className={`${inputClass} min-h-[88px]`}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
              placeholderTextColor={theme.muted}
            />
          </Field>

          <Pressable
            onPress={onSubmit}
            disabled={submit.isPending || !firstName.trim() || !lastName.trim() || !email.trim()}
            className="mt-2 items-center rounded-xl px-4 py-3.5"
            style={{
              backgroundColor: theme.primary,
              opacity: submit.isPending ? 0.6 : 1,
            }}
          >
            {submit.isPending ? (
              <ActivityIndicator color={theme.primaryForeground} />
            ) : (
              <Text className="text-sm font-bold" style={{ color: theme.primaryForeground }}>
                Submit
              </Text>
            )}
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
      {children}
    </View>
  );
}
