import React from 'react';
import { render, screen } from '@testing-library/react';
import LocationStreetviewView from './LocationStreetviewView';

describe('LocationStreetviewView', () => {
  const mockOnConfirm = jest.fn();
  const mockOnEdit = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('default preview when no override is set', () => {
    // GeoJSON order: [lng, lat].
    const resourceData = { position: { coordinates: [-74.0060, 40.7128] } };

    const renderDefault = (value = null, data = resourceData) => render(
      <LocationStreetviewView
        value={value}
        resourceData={data}
        onConfirm={mockOnConfirm}
        onEdit={mockOnEdit}
      />,
    );

    it("previews the location's own coordinates when there is no override", () => {
      renderDefault();
      const img = screen.getByAltText('Default Street View preview');
      expect(img.src).toContain('location=40.7128,-74.006');
    });

    it('uses a default point of view for the default preview', () => {
      renderDefault();
      const img = screen.getByAltText('Default Street View preview');
      expect(img.src).toContain('fov=90');
      expect(img.src).toContain('heading=0');
      expect(img.src).toContain('pitch=0');
    });

    it('still reports that no override is set', () => {
      renderDefault();
      expect(screen.getByText('Using Google default')).toBeInTheDocument();
      expect(screen.getByText(/the image above is Google/)).toBeInTheDocument();
    });

    it('prefers the override image over the default one', () => {
      renderDefault({ pano_id: null, lat: 35.6762, lng: 139.6503 });
      expect(screen.queryByAltText('Default Street View preview')).not.toBeInTheDocument();
      const img = screen.getByAltText('Street View preview');
      expect(img.src).toContain('location=35.6762,139.6503');
    });

    it('falls back to the default when the override has no anchor of its own', () => {
      renderDefault({
        pano_id: null, lat: null, lng: null, heading: 45,
      });
      const img = screen.getByAltText('Default Street View preview');
      expect(img.src).toContain('location=40.7128,-74.006');
    });

    it('renders no image when the location has no coordinates', () => {
      renderDefault(null, {});
      expect(screen.queryByAltText(/Street View preview/)).not.toBeInTheDocument();
      expect(screen.getByText(/Google.s default view will be used/)).toBeInTheDocument();
    });
  });

  describe('buildStaticImageUrl', () => {
    it('returns null when no value provided', () => {
      render(
        <LocationStreetviewView
          value={null}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      expect(screen.queryByAltText('Street View preview')).not.toBeInTheDocument();
    });

    it('builds URL with pano_id when present', () => {
      const value = { pano_id: 'test-pano-123', lat: null, lng: null };
      render(
        <LocationStreetviewView
          value={value}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      const img = screen.getByAltText('Street View preview');
      expect(img.src).toContain('pano=test-pano-123');
    });

    it('builds URL with lat/lng when pano_id absent', () => {
      const value = { pano_id: null, lat: 40.7128, lng: -74.0060 };
      render(
        <LocationStreetviewView
          value={value}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      const img = screen.getByAltText('Street View preview');
      expect(img.src).toContain('location=40.7128,-74.006');
    });

    it('includes heading, pitch, and fov in URL', () => {
      const value = {
        pano_id: 'pano-xyz',
        lat: null,
        lng: null,
        heading: 45,
        pitch: 20,
        fov: 75,
      };
      render(
        <LocationStreetviewView
          value={value}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      const img = screen.getByAltText('Street View preview');
      expect(img.src).toContain('heading=45');
      expect(img.src).toContain('pitch=20');
      expect(img.src).toContain('fov=75');
    });

    it('uses defaults for missing heading, pitch, fov', () => {
      const value = { pano_id: 'pano-abc', lat: null, lng: null };
      render(
        <LocationStreetviewView
          value={value}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      const img = screen.getByAltText('Street View preview');
      expect(img.src).toContain('heading=0');
      expect(img.src).toContain('pitch=0');
      expect(img.src).toContain('fov=90');
    });

    it('returns null when lat/lng incomplete (missing lng)', () => {
      const value = { pano_id: null, lat: 40.7128, lng: null };
      render(
        <LocationStreetviewView
          value={value}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      expect(screen.queryByAltText('Street View preview')).not.toBeInTheDocument();
    });
  });

  describe('override status', () => {
    it('shows "Using Google default" when no override', () => {
      render(
        <LocationStreetviewView
          value={null}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      expect(screen.getByText('Using Google default')).toBeInTheDocument();
      expect(screen.getByText(/No Street View override is set/)).toBeInTheDocument();
    });

    it('shows "Override active" when any field is non-null', () => {
      const value = { lat: 40.7128, lng: -74.0060, pano_id: null };
      render(
        <LocationStreetviewView
          value={value}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      expect(screen.getByText('Override active')).toBeInTheDocument();
    });

    it('shows all override details in table', () => {
      const value = {
        pano_id: 'pano-test-123',
        lat: 40.7128,
        lng: -74.0060,
        heading: 90,
        pitch: 15,
        fov: 85,
      };
      render(
        <LocationStreetviewView
          value={value}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      expect(screen.getByText('40.7128')).toBeInTheDocument();
      expect(screen.getByText('-74.006')).toBeInTheDocument();
      expect(screen.getByText('90°')).toBeInTheDocument();
      expect(screen.getByText('15°')).toBeInTheDocument();
      expect(screen.getByText('85°')).toBeInTheDocument();
      expect(screen.getByText('pano-test-123')).toBeInTheDocument();
    });

    it('omits pano_id from table when not present', () => {
      const value = {
        pano_id: null,
        lat: 40.7128,
        lng: -74.0060,
        heading: 90,
        pitch: null,
        fov: null,
      };
      render(
        <LocationStreetviewView
          value={value}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      expect(screen.queryByText(/Pano ID/)).not.toBeInTheDocument();
    });

    it('omits null coordinate values from table', () => {
      const value = {
        pano_id: 'pano-123',
        lat: null,
        lng: null,
        heading: 45,
        pitch: null,
        fov: 90,
      };
      render(
        <LocationStreetviewView
          value={value}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      expect(screen.queryByText(/Lat/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Lng/)).not.toBeInTheDocument();
      expect(screen.getByText('45°')).toBeInTheDocument();
      expect(screen.getByText('90°')).toBeInTheDocument();
    });
  });

  describe('confirmation options', () => {
    it('renders confirm and edit buttons', () => {
      render(
        <LocationStreetviewView
          value={null}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />,
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });
});
